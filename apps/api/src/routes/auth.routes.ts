import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rate-limiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@cakeday/shared';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', authRateLimiter, validate(registerSchema), authController.register.bind(authController));

// POST /api/v1/auth/login
router.post('/login', authRateLimiter, validate(loginSchema), authController.login.bind(authController));

// POST /api/v1/auth/logout
router.post('/logout', authenticate, authController.logout.bind(authController));

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));

// POST /api/v1/auth/reset-password
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword.bind(authController));

// GET /api/v1/auth/me
router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;
