import { db } from '@/lib/db';
import { orders, orderStatusHistory } from '@/lib/db/schema';
import { eq, and, or, ilike, count, asc, desc, inArray } from 'drizzle-orm';
import { NotFoundError, BadRequestError } from '@/lib/errors';
import type { PaginationParams } from '@/lib/utils/pagination';
import { buildMeta } from '@/lib/utils/pagination';
import type { UserRole } from '@/lib/shared';

type SupplierOrderStatus =
  | 'assigned'
  | 'accepted'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'rejected';

const SUPPLIER_VISIBLE_STATUSES: SupplierOrderStatus[] = [
  'assigned',
  'accepted',
  'preparing',
  'out_for_delivery',
  'delivered',
  'rejected',
];

export class SupplierService {
  async listSupplierOrders(
    supplierId: string,
    pagination: PaginationParams,
    filters: { status?: string; date_from?: string; date_to?: string },
  ) {
    const conditions = [eq(orders.supplier_id, supplierId)];

    if (filters.status) {
      const statuses = filters.status.split(',').map((s) => s.trim()) as SupplierOrderStatus[];
      if (statuses.length === 1) {
        conditions.push(eq(orders.status, statuses[0]));
      } else {
        conditions.push(inArray(orders.status, statuses));
      }
    } else {
      // Default: only show supplier-relevant statuses
      conditions.push(inArray(orders.status, SUPPLIER_VISIBLE_STATUSES));
    }

    if (filters.date_from) {
      conditions.push(eq(orders.delivery_date, filters.date_from));
    }

    if (pagination.search) {
      const term = `%${pagination.search}%`;
      conditions.push(or(ilike(orders.recipient_name, term), ilike(orders.delivery_address, term))!);
    }

    const whereClause = and(...conditions);

    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(orders)
      .where(whereClause);

    const orderFn = pagination.order === 'asc' ? asc : desc;
    const rows = await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(orderFn(orders.delivery_date))
      .limit(pagination.pageSize)
      .offset(pagination.offset);

    return {
      data: rows,
      meta: buildMeta(pagination.page, pagination.pageSize, Number(totalCount)),
    };
  }

  async getSupplierOrder(supplierId: string, orderId: string) {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.supplier_id, supplierId)))
      .limit(1);

    if (!order) throw new NotFoundError('Order', orderId);
    return order;
  }

  private async transitionOrderStatus(
    supplierId: string,
    orderId: string,
    userId: string,
    userRole: UserRole,
    fromStatuses: string[],
    toStatus: SupplierOrderStatus,
    note: string,
    extraFields: Record<string, unknown> = {},
  ) {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.supplier_id, supplierId)))
      .limit(1);

    if (!order) throw new NotFoundError('Order', orderId);

    if (!fromStatuses.includes(order.status)) {
      throw new BadRequestError(
        `'${order.status}' durumundan '${toStatus}' durumuna gecis yapilamaz.`,
      );
    }

    const [updated] = await db
      .update(orders)
      .set({
        status: toStatus,
        updated_at: new Date(),
        ...extraFields,
      })
      .where(eq(orders.id, orderId))
      .returning();

    await db.insert(orderStatusHistory).values({
      order_id: orderId,
      from_status: order.status as typeof orderStatusHistory.from_status._.data,
      to_status: toStatus,
      changed_by: userId,
      changed_by_role: userRole,
      note,
    });

    return updated;
  }

  async acceptOrder(supplierId: string, orderId: string, userId: string, role: UserRole) {
    return this.transitionOrderStatus(
      supplierId, orderId, userId, role,
      ['assigned'],
      'accepted',
      'Tedarikci tarafindan kabul edildi.',
      { accepted_at: new Date() },
    );
  }

  async rejectOrder(
    supplierId: string,
    orderId: string,
    userId: string,
    role: UserRole,
    reason: string,
  ) {
    return this.transitionOrderStatus(
      supplierId, orderId, userId, role,
      ['assigned', 'accepted'],
      'rejected',
      `Tedarikci tarafindan reddedildi: ${reason}`,
      { rejected_at: new Date() },
    );
  }

  async markPreparing(supplierId: string, orderId: string, userId: string, role: UserRole) {
    return this.transitionOrderStatus(
      supplierId, orderId, userId, role,
      ['accepted'],
      'preparing',
      'Siparis hazirlanmaya baslandi.',
    );
  }

  async markOutForDelivery(supplierId: string, orderId: string, userId: string, role: UserRole) {
    return this.transitionOrderStatus(
      supplierId, orderId, userId, role,
      ['preparing'],
      'out_for_delivery',
      'Siparis teslimatta.',
    );
  }

  async markDelivered(supplierId: string, orderId: string, userId: string, role: UserRole) {
    return this.transitionOrderStatus(
      supplierId, orderId, userId, role,
      ['out_for_delivery'],
      'delivered',
      'Siparis teslim edildi.',
      { delivered_at: new Date() },
    );
  }
}

export const supplierService = new SupplierService();
