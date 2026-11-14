"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.getConnectionStatus = getConnectionStatus;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const fs_1 = require("fs");
const logger_1 = require("../utils/logger");
let isConnected = false;
function buildMongoUri() {
    // For local development, use MONGODB_URI_DEV if set
    if (env_1.env.NODE_ENV === 'development' && env_1.env.MONGODB_URI_DEV) {
        return env_1.env.MONGODB_URI_DEV;
    }
    const baseUri = env_1.env.MONGODB_URI;
    const certFile = env_1.env.MONGODB_TLS_CERT_FILE;
    // If client cert exists, use the URI as-is (with X.509 authMechanism)
    if (certFile && (0, fs_1.existsSync)(certFile)) {
        return baseUri;
    }
    // For development without certs, remove X.509 auth mechanism from URI
    // This allows username/password auth if provided
    const url = new URL(baseUri);
    url.searchParams.delete('authMechanism');
    url.searchParams.delete('authSource');
    return url.toString();
}
async function connectDB() {
    if (isConnected) {
        logger_1.logger.debug('MongoDB already connected');
        return;
    }
    try {
        const uri = buildMongoUri();
        const dbName = env_1.env.MONGODB_DB;
        const options = {
            dbName,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2,
        };
        // X.509 certificate authentication (production)
        // Atlas uses public CAs for server certs — only client cert (client.pem) is required
        const certFile = env_1.env.MONGODB_TLS_CERT_FILE;
        if (certFile && (0, fs_1.existsSync)(certFile)) {
            options.tls = true;
            options.tlsCertificateKeyFile = certFile;
            options.authMechanism = 'MONGODB-X509';
            logger_1.logger.info('Using X.509 certificate authentication (client cert)');
        }
        else if (env_1.env.NODE_ENV === 'development') {
            logger_1.logger.warn('X.509 client certificate not found, using standard connection (dev mode)');
        }
        await mongoose_1.default.connect(uri, options);
        isConnected = true;
        logger_1.logger.info(`MongoDB connected: ${mongoose_1.default.connection.host}/${dbName}`);
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.logger.error({ err }, 'MongoDB connection error');
            isConnected = false;
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('MongoDB disconnected');
            isConnected = false;
        });
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            logger_1.logger.info('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    }
    catch (error) {
        logger_1.logger.error({ err: error }, 'MongoDB connection failed');
        throw error;
    }
}
function getConnectionStatus() {
    return isConnected && mongoose_1.default.connection.readyState === 1;
}
//# sourceMappingURL=database.js.map