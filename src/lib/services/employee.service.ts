import { db } from '@/lib/db';
import { employees } from '@/lib/db/schema';
import { eq, and, ilike, or, count, asc, desc } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '@/lib/errors';
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from '@/lib/shared';
import type { PaginationParams } from '@/lib/utils/pagination';
import { buildMeta } from '@/lib/utils/pagination';

export class EmployeeService {
  async listEmployees(
    companyId: string,
    pagination: PaginationParams,
    filters: {
      department?: string;
      status?: string;
      district?: string;
    },
  ) {
    const conditions = [eq(employees.company_id, companyId)];

    if (filters.department) {
      conditions.push(eq(employees.department, filters.department));
    }
    if (filters.status === 'active' || filters.status === 'inactive') {
      conditions.push(eq(employees.status, filters.status));
    }
    if (filters.district === 'besiktas' || filters.district === 'sariyer') {
      conditions.push(eq(employees.delivery_district, filters.district));
    }
    if (pagination.search) {
      const term = `%${pagination.search}%`;
      conditions.push(
        or(
          ilike(employees.first_name, term),
          ilike(employees.last_name, term),
          ilike(employees.work_email, term),
          ilike(employees.personal_email, term),
          ilike(employees.department, term),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(employees)
      .where(whereClause);

    const orderFn = pagination.order === 'asc' ? asc : desc;
    const sortCol =
      pagination.sort === 'first_name'
        ? employees.first_name
        : pagination.sort === 'last_name'
          ? employees.last_name
          : pagination.sort === 'date_of_birth'
            ? employees.date_of_birth
            : pagination.sort === 'department'
              ? employees.department
              : employees.created_at;

    const rows = await db
      .select()
      .from(employees)
      .where(whereClause)
      .orderBy(orderFn(sortCol))
      .limit(pagination.pageSize)
      .offset(pagination.offset);

    return {
      data: rows,
      meta: buildMeta(pagination.page, pagination.pageSize, Number(totalCount)),
    };
  }

  async getEmployee(companyId: string, employeeId: string) {
    const [employee] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, employeeId), eq(employees.company_id, companyId)))
      .limit(1);

    if (!employee) throw new NotFoundError('Employee', employeeId);
    return employee;
  }

  async createEmployee(companyId: string, input: CreateEmployeeInput) {
    const [employee] = await db
      .insert(employees)
      .values({
        company_id: companyId,
        first_name: input.first_name,
        last_name: input.last_name,
        date_of_birth: input.date_of_birth,
        start_date: input.start_date,
        department: input.department,
        office_location: input.office_location,
        delivery_address: input.delivery_address,
        delivery_district: input.delivery_district,
        personal_email: input.personal_email,
        work_email: input.work_email,
        source: 'manual',
      })
      .returning();

    return employee;
  }

  async updateEmployee(companyId: string, employeeId: string, input: UpdateEmployeeInput) {
    const [existing] = await db
      .select({ id: employees.id })
      .from(employees)
      .where(and(eq(employees.id, employeeId), eq(employees.company_id, companyId)))
      .limit(1);

    if (!existing) throw new NotFoundError('Employee', employeeId);

    const [updated] = await db
      .update(employees)
      .set({ ...input, updated_at: new Date() })
      .where(eq(employees.id, employeeId))
      .returning();

    return updated;
  }

  async deleteEmployee(companyId: string, employeeId: string, confirmName: string) {
    const [existing] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, employeeId), eq(employees.company_id, companyId)))
      .limit(1);

    if (!existing) throw new NotFoundError('Employee', employeeId);

    const fullName = `${existing.first_name} ${existing.last_name}`;
    if (confirmName.trim() !== fullName.trim()) {
      throw new BadRequestError(
        'Onay icin calisan adini dogru girmelisiniz.',
      );
    }

    // Soft delete: set status to inactive
    await db
      .update(employees)
      .set({ status: 'inactive', updated_at: new Date() })
      .where(eq(employees.id, employeeId));

    return { message: 'Calisan basariyla silindi.' };
  }

  /**
   * CSV Import Preview — parse rows and return validation summary.
   * Full implementation requires multer + CSV parsing.
   */
  async previewCsvImport(
    companyId: string,
    fileBuffer: Buffer,
    filename: string,
  ) {
    // TODO: Implement full CSV parsing with papaparse or csv-parse
    // For now, return a stub preview structure
    return {
      import_token: `csv_${Date.now()}`,
      total_rows: 0,
      valid_rows: 0,
      invalid_rows: 0,
      duplicate_rows: 0,
      preview: [],
      errors: [],
      message: 'CSV on-izleme hazir. Onaylamak icin import_token kullanin.',
    };
  }

  /**
   * CSV Import Confirm — persist validated rows.
   */
  async confirmCsvImport(
    companyId: string,
    importToken: string,
    importMode: 'valid_only' | 'all',
    duplicateAction: 'skip' | 'update' | 'create',
  ) {
    // TODO: Retrieve buffered CSV data from cache (Redis/memory) using importToken
    // and execute bulk insert
    return {
      created: 0,
      updated: 0,
      skipped: 0,
      message: 'Toplu iceri aktarma tamamlandi.',
    };
  }
}

export const employeeService = new EmployeeService();
