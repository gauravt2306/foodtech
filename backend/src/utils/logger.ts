import pino, { Logger, DestinationStream } from 'pino';
import { env } from '../config/env';

let transport: DestinationStream | undefined;

if (env.NODE_ENV !== 'production') {
  transport = pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  });
}

export const logger: Logger = pino(
  {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      service: 'foodtech-api',
      env: env.NODE_ENV,
    },
  },
  transport
);

export function createChildLogger(bindings: Record<string, unknown>): Logger {
  return logger.child(bindings);
}