import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`API prefix: ${env.API_PREFIX}`);
      logger.info(`Health check: http://localhost:${env.PORT}/health`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after 10s');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();