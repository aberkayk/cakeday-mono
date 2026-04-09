import { db } from '@/lib/db';
import { orders, orderStatusHistory, cakePrices, cakeTypes, companies } from '@/lib/db/schema';
import { eq, and, or, ilike, inArray, gte, lte, count, asc, desc, sql } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '@/lib/errors';
import type { CreateAdHocOrderInput, CancelOrderInput } from '@/lib/shared';
import type { PaginationParams } from '@/lib/utils/pagination';
import { buildMeta } from '@/lib/utils/pagination';
import type { UserRole } from '@/lib/shared';

export class OrderService {
  async listOrders(
    companyId: string,
    pagination: PaginationParams,
    filters: {
      status?: string;
      order_type?: string;
      delivery_date_from?: string;
      delivery_date_to?: string;
      district?: string;
      employee_id?: string;
    },
  ) {
    const conditions = [eq(orders.company_id, companyId)];

    if (filters.status) {
      const statuses = filters.status.split(',').map((s) => s.trim());
      // Build or clause for multiple statuses
      if (statuses.length === 1) {
        const status = statuses[0] as typeof orders.status._.data;
        conditions.push(eq(orders.status, status));
      } else {
        const validStatuses = statuses as Array<typeof orders.status._.data>;
        conditions.push(inArray(orders.status, validStatuses));
      }
    }

    if (filters.order_type === 'automatic' || filters.order_type === 'ad_hoc') {
      conditions.push(eq(orders.order_type, filters.order_type));
    }

    if (filters.delivery_date_from) {
      conditions.push(gte(orders.delivery_date, filters.delivery_date_from));
    }
    if (filters.delivery_date_to) {
      conditions.push(lte(orders.delivery_date, filters.delivery_date_to));
    }

    if (filters.district === 'besiktas' || filters.district === 'sariyer') {
      conditions.push(eq(orders.delivery_district, filters.district));
    }

    if (filters.employee_id) {
      conditions.push(eq(orders.employee_id, filters.employee_id));
    }

    if (pagination.search) {
      const term = `%${pagination.search}%`;
      conditions.push(
        or(ilike(orders.recipient_name, term), ilike(orders.delivery_address, term))!,
      );
    }

    const whereClause = and(...conditions);

    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(orders)
      .where(whereClause);

    const orderFn = pagination.order === 'asc' ? asc : desc;
    const sortCol =
      pagination.sort === 'delivery_date'
        ? orders.delivery_date
        : pagination.sort === 'status'
          ? orders.status
          : pagination.sort === 'order_total_try'
            ? orders.order_total_try
            : orders.created_at;

    const rows = await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(orderFn(sortCol))
      .limit(pagination.pageSize)
      .offset(pagination.offset);

    return {
      data: rows,
      meta: buildMeta(pagination.page, pagination.pageSize, Number(totalCount)),
    };
  }

  async getOrder(companyId: string, orderId: string) {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.company_id, companyId)))
      .limit(1);

    if (!order) throw new NotFoundError('Order', orderId);
    return order;
  }

  async createAdHocOrder(
    companyId: string,
    userId: string,
    input: CreateAdHocOrderInput,
  ) {
    // Fetch current price for the cake type + size
    const [priceRow] = await db
      .select({ price_try: cakePrices.price_try })
      .from(cakePrices)
      .where(
        and(
          eq(cakePrices.cake_type_id, input.cake_type_id),
          eq(cakePrices.size, input.cake_size),
          sql`(${cakePrices.valid_until} IS NULL OR ${cakePrices.valid_until} >= CURRENT_DATE)`,
        ),
      )
      .orderBy(desc(cakePrices.valid_from))
      .limit(1);

    if (!priceRow) {
      throw new BadRequestError('Secilen pasta turu ve boyutu icin fiyat bulunamadi.');
    }

    // Fetch company commission rate via subscription plan
    const [company] = await db
      .select({
        require_order_approval: companies.require_order_approval,
      })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company) throw new NotFoundError('Company', companyId);

    const basePrice = Number(priceRow.price_try);
    const platformFee = basePrice * 0.1; // 10% default commission
    const vatRate = 0.2; // 20% VAT
    const orderTotal = (basePrice + platformFee) * (1 + vatRate);
    const needsApproval = company.require_order_approval;

    const [order] = await db
      .insert(orders)
      .values({
        company_id: companyId,
        employee_id: input.employee_id,
        order_type: 'ad_hoc',
        recipient_name: input.recipient_name,
        recipient_phone: input.recipient_phone,
        delivery_date: input.delivery_date,
        delivery_address: input.delivery_address,
        delivery_district: input.delivery_district,
        delivery_window: input.delivery_window ?? 'no_preference',
        cake_type_id: input.cake_type_id,
        cake_size: input.cake_size,
        custom_text: input.custom_text,
        status: needsApproval ? 'pending_approval' : 'confirmed',
        base_price_try: String(basePrice),
        platform_fee_try: String(platformFee),
        vat_rate: String(vatRate),
        order_total_try: String(orderTotal),
      })
      .returning();

    // Record initial status history
    await db.insert(orderStatusHistory).values({
      order_id: order.id,
      from_status: null,
      to_status: order.status,
      changed_by: userId,
      changed_by_role: 'company_owner', // will be actual role in production
      note: 'Ad-hoc siparis olusturuldu.',
    });

    return order;
  }

  async cancelOrder(
    companyId: string,
    orderId: string,
    userId: string,
    userRole: UserRole,
    input: CancelOrderInput,
  ) {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.company_id, companyId)))
      .limit(1);

    if (!order) throw new NotFoundError('Order', orderId);

    const cancellableStatuses = ['draft', 'pending_approval', 'confirmed', 'assigned', 'accepted'];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestError(
        `'${order.status}' durumundaki siparis iptal edilemez.`,
      );
    }

    const newStatus =
      order.status === 'assigned' || order.status === 'accepted' || order.status === 'preparing'
        ? 'cancellation_requested'
        : 'cancelled';

    const [updated] = await db
      .update(orders)
      .set({
        status: newStatus,
        cancelled_by: userId,
        cancelled_at: new Date(),
        cancellation_reason: input.reason,
        updated_at: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    await db.insert(orderStatusHistory).values({
      order_id: orderId,
      from_status: order.status,
      to_status: newStatus,
      changed_by: userId,
      changed_by_role: userRole,
      note: input.reason ?? 'Kullanici tarafindan iptal edildi.',
    });

    return updated;
  }
}

export const orderService = new OrderService();
