"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const SKIP_PATHS = ['/health', '/favicon.ico'];
function requestLogger(req, res, next) {
    if (SKIP_PATHS.includes(req.path)) {
        return next();
    }
    const start = process.hrtime.bigint();
    const log = req.log || console;
    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
        log.info({
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            latencyMs: Math.round(durationMs),
            ip: req.ip,
            userAgent: req.get('user-agent'),
        }, `${req.method} ${req.path} ${res.statusCode} ${Math.round(durationMs)}ms`);
    });
    next();
}
//# sourceMappingURL=requestLogger.js.map