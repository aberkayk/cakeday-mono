import type { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { parsePagination } from '../utils/pagination';

export class OrderController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = parsePagination(req, 'delivery_date');
      const filters = {
        status: req.query.status as string | undefined,
        order_type: req.query.order_type as string | undefined,
        delivery_date_from: req.query.delivery_date_from as string | undefined,
        delivery_date_to: req.query.delivery_date_to as string | undefined,
        district: req.query.district as string | undefined,
        employee_id: req.query.employee_id as string | undefined,
      };
      const { data, meta } = await orderService.listOrders(
        req.user!.company_id!,
        pagination,
        filters,
      );
      sendPaginated(res, data, meta);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.createAdHocOrder(
        req.user!.company_id!,
        req.user!.id,
        req.body,
      );
      sendCreated(res, order);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.getOrder(req.user!.company_id!, req.params.id);
      sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.cancelOrder(
        req.user!.company_id!,
        req.params.id,
        req.user!.id,
        req.user!.role,
        req.body,
      );
      sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
