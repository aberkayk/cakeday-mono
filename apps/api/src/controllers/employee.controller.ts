import type { Request, Response, NextFunction } from 'express';
import { employeeService } from '../services/employee.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import { BadRequestError } from '../utils/errors';

export class EmployeeController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = parsePagination(req, 'created_at');
      const filters = {
        department: req.query.department as string | undefined,
        status: req.query.status as string | undefined,
        district: req.query.district as string | undefined,
      };
      const { data, meta } = await employeeService.listEmployees(
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
      const employee = await employeeService.createEmployee(req.user!.company_id!, req.body);
      sendCreated(res, employee);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await employeeService.getEmployee(req.user!.company_id!, req.params.id);
      sendSuccess(res, employee);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await employeeService.updateEmployee(
        req.user!.company_id!,
        req.params.id,
        req.body,
      );
      sendSuccess(res, employee);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { confirm_name } = req.body as { confirm_name: string };
      if (!confirm_name) {
        throw new BadRequestError('confirm_name gereklidir.');
      }
      const result = await employeeService.deleteEmployee(
        req.user!.company_id!,
        req.params.id,
        confirm_name,
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async importPreview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = (req as unknown as { file?: Express.Multer.File }).file;
      if (!file) {
        throw new BadRequestError('CSV dosyasi gereklidir.');
      }
      const result = await employeeService.previewCsvImport(
        req.user!.company_id!,
        file.buffer,
        file.originalname,
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async importConfirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { import_token, import_mode, duplicate_action } = req.body;
      const result = await employeeService.confirmCsvImport(
        req.user!.company_id!,
        import_token,
        import_mode ?? 'valid_only',
        duplicate_action ?? 'skip',
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const employeeController = new EmployeeController();
