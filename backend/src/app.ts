import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { requestLogger } from './middleware/requestLogger';
import authRoutes from './routes/auth.routes';
import superadminRoutes from './routes/superadmin.routes';
import vendorRoutes from './routes/vendor.routes';
import employeeRoutes from './routes/employee.routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request ID & logging (early in stack)
app.use(requestId);
app.use(requestLogger);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

const apiPrefix = env.API_PREFIX;
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/superadmin`, superadminRoutes);
app.use(`${apiPrefix}/vendor`, vendorRoutes);
app.use(`${apiPrefix}/employee`, employeeRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;