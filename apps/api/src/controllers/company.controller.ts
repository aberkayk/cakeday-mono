import type { Request, Response, NextFunction } from 'express';
import { companyService } from '../services/company.service';
import { sendSuccess } from '../utils/response';

export class CompanyController {
  async getMyCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await companyService.getCompany(req.user!.company_id!);
      sendSuccess(res, company);
    } catch (err) {
      next(err);
    }
  }

  async updateMyCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await companyService.updateCompany(req.user!.company_id!, req.body);
      sendSuccess(res, company);
    } catch (err) {
      next(err);
    }
  }

  async getMySettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await companyService.getCompanySettings(req.user!.company_id!);
      sendSuccess(res, settings);
    } catch (err) {
      next(err);
    }
  }

  async updateMySettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await companyService.updateCompanySettings(req.user!.company_id!, req.body);
      sendSuccess(res, settings);
    } catch (err) {
      next(err);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const members = await companyService.getMembers(req.user!.company_id!);
      sendSuccess(res, members);
    } catch (err) {
      next(err);
    }
  }

  async inviteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await companyService.inviteMember(
        req.user!.company_id!,
        req.user!.id,
        req.body,
      );
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }
}

export const companyController = new CompanyController();
