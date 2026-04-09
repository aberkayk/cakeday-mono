/**
 * Calculate the next birthday from a date of birth
 */
export function getNextBirthday(dateOfBirth: string): Date {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());

  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  return nextBirthday;
}

/**
 * Calculate age at the next birthday
 */
export function getNextBirthdayAge(dateOfBirth: string): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  const nextBirthday = getNextBirthday(dateOfBirth);
  return nextBirthday.getFullYear() - dob.getFullYear();
}

/**
 * Days until a future date
 */
export function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate pagination metadata
 */
export function paginate(totalCount: number, page: number, pageSize: number) {
  return {
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

/**
 * Slugify a string for URL-safe identifiers
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Format currency amount in TRY
 */
export function formatTRY(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
}

/**
 * Replace template tokens like {ad} with actual values
 */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

/**
 * Generate a cryptographically random token string
 */
export function generateToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
