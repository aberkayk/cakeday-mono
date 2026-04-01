import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * General API rate limiter applied to all routes.
 */
export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Cok fazla istek gonderdiniz. Lutfen bir sure bekleyip tekrar deneyin.',
    },
  },
});

/**
 * Strict rate limiter for auth endpoints (login, register, forgot-password).
 * 10 attempts per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Cok fazla giris denemesi. Lutfen 15 dakika bekleyip tekrar deneyin.',
    },
  },
});

/**
 * Lighter rate limiter for read-heavy endpoints.
 * 300 requests per 15 minutes per IP.
 */
export const readRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Cok fazla istek gonderdiniz. Lutfen bir sure bekleyip tekrar deneyin.',
    },
  },
});
