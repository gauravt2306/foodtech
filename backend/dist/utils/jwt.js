"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.decodeToken = decodeToken;
exports.extractTokenFromHeader = extractTokenFromHeader;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../config/jwt");
const signOptions = { algorithm: 'HS256' };
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign({ ...payload, type: 'access' }, jwt_1.jwtConfig.secret, { ...signOptions, expiresIn: jwt_1.jwtConfig.expiresIn });
}
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign({ ...payload, type: 'refresh' }, jwt_1.jwtConfig.refreshSecret, { ...signOptions, expiresIn: jwt_1.jwtConfig.refreshExpiresIn });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, jwt_1.jwtConfig.secret, { algorithms: ['HS256'] });
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, jwt_1.jwtConfig.refreshSecret, { algorithms: ['HS256'] });
}
function decodeToken(token) {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch {
        return null;
    }
}
function extractTokenFromHeader(authHeader) {
    if (!authHeader)
        return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
        return null;
    return parts[1];
}
//# sourceMappingURL=jwt.js.map