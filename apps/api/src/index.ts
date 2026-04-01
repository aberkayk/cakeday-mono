import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { corsMiddleware } from './middleware/cors';
import { generalRateLimiter } from './middleware/rate-limiter';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

// Route imports
import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import employeeRoutes from './routes/employee.routes';
import orderingRuleRoutes from './routes/ordering-rule.routes';
import orderRoutes from './routes/order.routes';
import cakeRoutes from './routes/cake.routes';
import bakeryRoutes from './routes/bakery.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// ─── Security & Parsing Middleware ────────────────────────────────────────────

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────────

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Global Rate Limiting ────────────────────────────────────────────────────

app.use('/api/', generalRateLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: 'v1',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

const API_V1 = '/api/v1';

app.use(`${API_V1}/auth`, authRoutes);
app.use(`${API_V1}/companies`, companyRoutes);
app.use(`${API_V1}/employees`, employeeRoutes);
app.use(`${API_V1}/ordering-rules`, orderingRuleRoutes);
app.use(`${API_V1}/orders`, orderRoutes);
app.use(`${API_V1}/cakes`, cakeRoutes);
app.use(`${API_V1}/bakery`, bakeryRoutes);
app.use(`${API_V1}/admin`, adminRoutes);

// ─── 404 & Error Handlers ─────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`CakeDay API running on port ${PORT} [${env.NODE_ENV}]`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcing shutdown.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
