import type { Request, Response, NextFunction } from 'express';
import { bakeryService } from '../services/bakery.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import { BadRequestError } from '../utils/errors';

export class BakeryController {
  async listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = parsePagination(req, 'delivery_date');
      const filters = {
        status: req.query.status as string | undefined,
        date_from: req.query.date_from as string | undefined,
        date_to: req.query.date_to as string | undefined,
      };
      const { data, meta } = await bakeryService.listBakeryOrders(
        req.user!.bakery_id!,
        pagination,
        filters,
      );
      sendPaginated(res, data, meta);
    } catch (err) {
      next(err);
    }
  }

  async getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await bakeryService.getBakeryOrder(req.user!.bakery_id!, req.params.id);
      sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  }

  async acceptOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await bakeryService.acceptOrder(
        req.user!.bakery_id!,
        req.params.id,
        req.user!.id,
        req.user!.role,
      );
      sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  }

  async rejectOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reason } = req.body as { reason: string };
      if (!reason) throw new BadRequestError('Red nedeni gereklidir.');
      const order = await bakeryService.rejectOrder(
        req.user!.bakery_id!,
        req.params.id,
        req.user!.id,
        req.user!.role,
        reason,
      );
      sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  }

  async markPreparing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await bakeryService.markPreparing(
        req.user!.bakery_id!,
        req.params.id,
        req.user!.id,
        req.user!.role,
      );
      sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  }

  async markOutForDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await bakeryService.markOutForDelivery(
        req.user!.bakery_id!,
        req.params.id,
        req.user!.id,
        req.user!.role,
      );
      sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  }

  async markDelivered(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await bakeryService.markDelivered(
        req.user!.bakery_id!,
        req.params.id,
        req.user!.id,
        req.user!.role,
      );
      sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  }
}

export const bakeryController = new BakeryController();
