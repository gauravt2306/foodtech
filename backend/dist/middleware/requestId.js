"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = requestId;
const logger_1 = require("../utils/logger");
function requestId(req, res, next) {
    const reqId = req.headers['x-request-id'] || crypto.randomUUID();
    req.id = reqId;
    res.setHeader('x-request-id', reqId);
    req.log = (0, logger_1.createChildLogger)({ reqId });
    next();
}
//# sourceMappingURL=requestId.js.map