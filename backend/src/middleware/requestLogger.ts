import { Request, Response, NextFunction } from 'express';

const SKIP_PATHS = ['/health', '/favicon.ico'];

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (SKIP_PATHS.includes(req.path)) {
    return next();
  }

  const start = process.hrtime.bigint();
  const log = req.log || console;

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    log.info(
      {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        latencyMs: Math.round(durationMs),
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
      `${req.method} ${req.path} ${res.statusCode} ${Math.round(durationMs)}ms`
    );
  });

  next();
}