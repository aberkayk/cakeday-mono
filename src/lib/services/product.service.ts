import { db } from '@/lib/db';
import { productTypes, productPrices } from '@/lib/db/schema';
import { eq, and, isNull, or, gte, inArray, sql } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';

export class ProductService {
  async listProducts() {
    // Fetch all active product types with their current prices
    const types = await db
      .select()
      .from(productTypes)
      .where(eq(productTypes.is_active, true))
      .orderBy(productTypes.display_order, productTypes.name);

    const typeIds = types.map((t) => t.id);
    if (typeIds.length === 0) return [];

    // Fetch current prices (valid today, no future end date or end date in future)
    const prices = await db
      .select()
      .from(productPrices)
      .where(
        and(
          inArray(productPrices.product_type_id, typeIds),
          sql`${productPrices.valid_from} <= CURRENT_DATE`,
          or(isNull(productPrices.valid_until), gte(productPrices.valid_until, sql`CURRENT_DATE`)),
        ),
      );

    // Group prices by product_type_id
    const priceMap = new Map<string, typeof prices>();
    for (const price of prices) {
      if (!priceMap.has(price.product_type_id)) {
        priceMap.set(price.product_type_id, []);
      }
      priceMap.get(price.product_type_id)!.push(price);
    }

    return types.map((type) => ({
      ...type,
      prices: priceMap.get(type.id) ?? [],
    }));
  }

  async getProduct(productId: string) {
    const [productType] = await db
      .select()
      .from(productTypes)
      .where(eq(productTypes.id, productId))
      .limit(1);

    if (!productType) throw new NotFoundError('ProductType', productId);

    const prices = await db
      .select()
      .from(productPrices)
      .where(
        and(
          eq(productPrices.product_type_id, productId),
          sql`${productPrices.valid_from} <= CURRENT_DATE`,
          or(isNull(productPrices.valid_until), gte(productPrices.valid_until, sql`CURRENT_DATE`)),
        ),
      );

    return { ...productType, prices };
  }
}

export const productService = new ProductService();
