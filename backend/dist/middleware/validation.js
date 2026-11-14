"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const zod_1 = require("zod");
const ApiError_1 = require("../utils/ApiError");
function validate(schema) {
    return async (req, _res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = {};
                for (const issue of error.issues) {
                    const path = issue.path.join('.');
                    if (!errors[path])
                        errors[path] = [];
                    errors[path].push(issue.message);
                }
                throw ApiError_1.ApiError.badRequest('Validation failed', errors);
            }
            throw error;
        }
    };
}
function validateBody(schema) {
    return validate(schema);
}
function validateQuery(schema) {
    return async (req, _res, next) => {
        try {
            req.query = await schema.parseAsync(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = {};
                for (const issue of error.issues) {
                    const path = issue.path.join('.');
                    if (!errors[path])
                        errors[path] = [];
                    errors[path].push(issue.message);
                }
                throw ApiError_1.ApiError.badRequest('Invalid query parameters', errors);
            }
            throw error;
        }
    };
}
function validateParams(schema) {
    return async (req, _res, next) => {
        try {
            req.params = await schema.parseAsync(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = {};
                for (const issue of error.issues) {
                    const path = issue.path.join('.');
                    if (!errors[path])
                        errors[path] = [];
                    errors[path].push(issue.message);
                }
                throw ApiError_1.ApiError.badRequest('Invalid route parameters', errors);
            }
            throw error;
        }
    };
}
//# sourceMappingURL=validation.js.map