import { db } from '@/lib/db';
import { orderingRules } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import type {
  CreateOrderingRuleInput,
  UpdateOrderingRuleInput,
} from '@/lib/shared';

export class OrderingRuleService {
  async listRules(companyId: string) {
    return db
      .select()
      .from(orderingRules)
      .where(eq(orderingRules.company_id, companyId))
      .orderBy(orderingRules.created_at);
  }

  async getRule(companyId: string, ruleId: string) {
    const [rule] = await db
      .select()
      .from(orderingRules)
      .where(and(eq(orderingRules.id, ruleId), eq(orderingRules.company_id, companyId)))
      .limit(1);

    if (!rule) throw new NotFoundError('OrderingRule', ruleId);
    return rule;
  }

  async createRule(companyId: string, createdBy: string, input: CreateOrderingRuleInput) {
    const [rule] = await db
      .insert(orderingRules)
      .values({
        company_id: companyId,
        created_by: createdBy,
        name: input.name,
        rule_type: input.rule_type,
        milestone_ages: input.milestone_ages,
        anniversary_years: input.anniversary_years,
        default_product_type_id: input.default_product_type_id,
        default_product_size: input.default_product_size ?? 'medium',
        custom_text_template: input.custom_text_template,
        is_active: input.is_active ?? true,
      })
      .returning();

    return rule;
  }

  async updateRule(companyId: string, ruleId: string, input: UpdateOrderingRuleInput) {
    const [existing] = await db
      .select({ id: orderingRules.id })
      .from(orderingRules)
      .where(and(eq(orderingRules.id, ruleId), eq(orderingRules.company_id, companyId)))
      .limit(1);

    if (!existing) throw new NotFoundError('OrderingRule', ruleId);

    const [updated] = await db
      .update(orderingRules)
      .set({ ...input, updated_at: new Date() })
      .where(eq(orderingRules.id, ruleId))
      .returning();

    return updated;
  }

  async deleteRule(companyId: string, ruleId: string) {
    const [existing] = await db
      .select({ id: orderingRules.id })
      .from(orderingRules)
      .where(and(eq(orderingRules.id, ruleId), eq(orderingRules.company_id, companyId)))
      .limit(1);

    if (!existing) throw new NotFoundError('OrderingRule', ruleId);

    await db.delete(orderingRules).where(eq(orderingRules.id, ruleId));
    return { message: 'Siparis kurali basariyla silindi.' };
  }
}

export const orderingRuleService = new OrderingRuleService();
