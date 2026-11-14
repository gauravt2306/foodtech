"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
async function startServer() {
    try {
        await (0, database_1.connectDB)();
        const server = app_1.default.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`Server running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
            logger_1.logger.info(`API prefix: ${env_1.env.API_PREFIX}`);
            logger_1.logger.info(`Health check: http://localhost:${env_1.env.PORT}/health`);
        });
        const shutdown = async (signal) => {
            logger_1.logger.info(`${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                logger_1.logger.info('HTTP server closed');
                process.exit(0);
            });
            setTimeout(() => {
                logger_1.logger.error('Forced shutdown after 10s');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        logger_1.logger.error({ err: error }, 'Failed to start server');
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map