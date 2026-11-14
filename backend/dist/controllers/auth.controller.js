"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.me = me;
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
const ApiError_1 = require("../utils/ApiError");
const repositories_1 = require("../repositories");
function getUserResponse(user, accessToken, refreshToken) {
    return {
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            isActive: user.isActive,
        },
        accessToken,
        refreshToken,
    };
}
async function register(req, res) {
    const { email, password, name, phone, role } = req.body;
    const existingUser = await repositories_1.userRepository.findByEmail(email);
    if (existingUser) {
        throw ApiError_1.ApiError.conflict('Email already registered');
    }
    const passwordHash = await (0, password_1.hashPassword)(password);
    const user = await repositories_1.userRepository.create({
        email,
        passwordHash,
        name,
        phone,
        role,
        isActive: true,
    });
    const payload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        vendorProfileId: user.vendorProfile?.toString(),
    };
    const accessToken = (0, jwt_1.generateAccessToken)(payload);
    const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
    res.status(201).json({
        success: true,
        data: getUserResponse(user, accessToken, refreshToken),
    });
}
async function login(req, res) {
    const { email, password } = req.body;
    const user = await repositories_1.userRepository.model.findOne({ email }).select('+passwordHash');
    if (!user) {
        throw ApiError_1.ApiError.unauthorized('Invalid credentials');
    }
    if (!user.isActive) {
        throw ApiError_1.ApiError.forbidden('Account is deactivated');
    }
    const isValid = await (0, password_1.comparePassword)(password, user.passwordHash);
    if (!isValid) {
        throw ApiError_1.ApiError.unauthorized('Invalid credentials');
    }
    user.lastLoginAt = new Date();
    await user.save();
    const payload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        vendorProfileId: user.vendorProfile?.toString(),
    };
    const accessToken = (0, jwt_1.generateAccessToken)(payload);
    const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
    res.json({
        success: true,
        data: getUserResponse(user, accessToken, refreshToken),
    });
}
async function refresh(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw ApiError_1.ApiError.unauthorized('Refresh token required');
    }
    try {
        const { verifyRefreshToken } = await import('../utils/jwt.js');
        const payload = verifyRefreshToken(refreshToken);
        if (payload.type !== 'refresh') {
            throw ApiError_1.ApiError.unauthorized('Invalid token type');
        }
        const user = await repositories_1.userRepository.findById(payload.sub);
        if (!user || !user.isActive) {
            throw ApiError_1.ApiError.unauthorized('User not found or deactivated');
        }
        const newPayload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
            vendorProfileId: user.vendorProfile?.toString(),
        };
        const accessToken = (0, jwt_1.generateAccessToken)(newPayload);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(newPayload);
        res.json({
            success: true,
            data: { accessToken, refreshToken: newRefreshToken },
        });
    }
    catch {
        throw ApiError_1.ApiError.unauthorized('Invalid refresh token');
    }
}
async function logout(_req, res) {
    // In a production app, you'd invalidate the refresh token in a blacklist/Redis
    res.json({
        success: true,
        data: { message: 'Logged out successfully' },
    });
}
async function me(req, res) {
    const user = await repositories_1.userRepository.findById(req.user.sub);
    if (!user) {
        throw ApiError_1.ApiError.notFound('User not found');
    }
    // Populate vendor profile if needed
    let vendorProfile = null;
    if (user.vendorProfile) {
        const { vendorProfileRepository } = await import('../repositories/index.js');
        vendorProfile = await vendorProfileRepository.findById(user.vendorProfile);
    }
    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone,
                avatarUrl: user.avatarUrl,
                isActive: user.isActive,
                vendorProfile,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
            },
        },
    });
}
//# sourceMappingURL=auth.controller.js.map