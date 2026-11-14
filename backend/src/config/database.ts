import mongoose from 'mongoose';
import { env } from './env';
import { existsSync } from 'fs';
import { logger } from '../utils/logger';

let isConnected = false;

function buildMongoUri(): string {
  // For local development, use MONGODB_URI_DEV if set
  if (env.NODE_ENV === 'development' && env.MONGODB_URI_DEV) {
    return env.MONGODB_URI_DEV;
  }

  const baseUri = env.MONGODB_URI;
  const certFile = env.MONGODB_TLS_CERT_FILE;

  // If client cert exists, use the URI as-is (with X.509 authMechanism)
  if (certFile && existsSync(certFile)) {
    return baseUri;
  }

  // For development without certs, remove X.509 auth mechanism from URI
  // This allows username/password auth if provided
  const url = new URL(baseUri);
  url.searchParams.delete('authMechanism');
  url.searchParams.delete('authSource');
  return url.toString();
}

export async function connectDB(): Promise<void> {
  if (isConnected) {
    logger.debug('MongoDB already connected');
    return;
  }

  try {
    const uri = buildMongoUri();
    const dbName = env.MONGODB_DB;

    const options: mongoose.ConnectOptions = {
      dbName,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    // X.509 certificate authentication (production)
    // Atlas uses public CAs for server certs — only client cert (client.pem) is required
    const certFile = env.MONGODB_TLS_CERT_FILE;

    if (certFile && existsSync(certFile)) {
      options.tls = true;
      options.tlsCertificateKeyFile = certFile;
      options.authMechanism = 'MONGODB-X509';
      logger.info('Using X.509 certificate authentication (client cert)');
    } else if (env.NODE_ENV === 'development') {
      logger.warn('X.509 client certificate not found, using standard connection (dev mode)');
    }

    await mongoose.connect(uri, options);
    isConnected = true;

    logger.info(`MongoDB connected: ${mongoose.connection.host}/${dbName}`);

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failed');
    throw error;
  }
}

export function getConnectionStatus(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}