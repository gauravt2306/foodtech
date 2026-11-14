"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createChildLogger = createChildLogger;
const pino_1 = __importDefault(require("pino"));
const env_1 = require("../config/env");
let transport;
if (env_1.env.NODE_ENV !== 'production') {
    transport = pino_1.default.transport({
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
        },
    });
}
exports.logger = (0, pino_1.default)({
    level: env_1.env.NODE_ENV === 'production' ? 'info' : 'debug',
    formatters: {
        level: (label) => ({ level: label }),
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    base: {
        service: 'foodtech-api',
        env: env_1.env.NODE_ENV,
    },
}, transport);
function createChildLogger(bindings) {
    return exports.logger.child(bindings);
}
//# sourceMappingURL=logger.js.map