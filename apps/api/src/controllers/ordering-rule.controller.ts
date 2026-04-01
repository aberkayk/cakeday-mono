import type { Request, Response, NextFunction } from 'express';
import { orderingRuleService } from '../services/ordering-rule.service';
import { sendSuccess, sendCreated } from '../utils/response';

export class OrderingRuleController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rules = await orderingRuleService.listRules(req.user!.company_id!);
      sendSuccess(res, rules);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await orderingRuleService.createRule(
        req.user!.company_id!,
        req.user!.id,
        req.body,
      );
      sendCreated(res, rule);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await orderingRuleService.getRule(req.user!.company_id!, req.params.id);
      sendSuccess(res, rule);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await orderingRuleService.updateRule(
        req.user!.company_id!,
        req.params.id,
        req.body,
      );
      sendSuccess(res, rule);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await orderingRuleService.deleteRule(req.user!.company_id!, req.params.id);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const orderingRuleController = new OrderingRuleController();
