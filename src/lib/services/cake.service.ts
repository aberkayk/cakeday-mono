import { db } from '@/lib/db';
import { cakeTypes, cakePrices } from '@/lib/db/schema';
import { eq, and, isNull, or, gte, inArray, sql } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';

export class CakeService {
  async listCakes() {
    // Fetch all active cake types with their current prices
    const types = await db
      .select()
      .from(cakeTypes)
      .where(eq(cakeTypes.is_active, true))
      .orderBy(cakeTypes.display_order, cakeTypes.name);

    const typeIds = types.map((t) => t.id);
    if (typeIds.length === 0) return [];

    // Fetch current prices (valid today, no future end date or end date in future)
    const prices = await db
      .select()
      .from(cakePrices)
      .where(
        and(
          inArray(cakePrices.cake_type_id, typeIds),
          sql`${cakePrices.valid_from} <= CURRENT_DATE`,
          or(isNull(cakePrices.valid_until), gte(cakePrices.valid_until, sql`CURRENT_DATE`)),
        ),
      );

    // Group prices by cake_type_id
    const priceMap = new Map<string, typeof prices>();
    for (const price of prices) {
      if (!priceMap.has(price.cake_type_id)) {
        priceMap.set(price.cake_type_id, []);
      }
      priceMap.get(price.cake_type_id)!.push(price);
    }

    return types.map((type) => ({
      ...type,
      prices: priceMap.get(type.id) ?? [],
    }));
  }

  async getCake(cakeId: string) {
    const [cakeType] = await db
      .select()
      .from(cakeTypes)
      .where(eq(cakeTypes.id, cakeId))
      .limit(1);

    if (!cakeType) throw new NotFoundError('CakeType', cakeId);

    const prices = await db
      .select()
      .from(cakePrices)
      .where(
        and(
          eq(cakePrices.cake_type_id, cakeId),
          sql`${cakePrices.valid_from} <= CURRENT_DATE`,
          or(isNull(cakePrices.valid_until), gte(cakePrices.valid_until, sql`CURRENT_DATE`)),
        ),
      );

    return { ...cakeType, prices };
  }
}

export const cakeService = new CakeService();
