import type { Request, Response, NextFunction } from 'express';
import { cakeService } from '../services/cake.service';
import { sendSuccess } from '../utils/response';

export class CakeController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cakes = await cakeService.listCakes();
      sendSuccess(res, cakes);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cake = await cakeService.getCake(req.params.id);
      sendSuccess(res, cake);
    } catch (err) {
      next(err);
    }
  }
}

export const cakeController = new CakeController();
