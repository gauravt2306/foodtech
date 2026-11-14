import { Response } from 'express';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/password';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth';
import { JwtPayload } from '../config/jwt';
import { userRepository } from '../repositories';

function getUserResponse(user: any, accessToken: string, refreshToken: string) {
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

export async function register(req: AuthenticatedRequest, res: Response) {
  const { email, password, name, phone, role } = req.body;

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const passwordHash = await hashPassword(password);

  const user = await userRepository.create({
    email,
    passwordHash,
    name,
    phone,
    role,
    isActive: true,
  });

  const payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'> = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    vendorProfileId: user.vendorProfile?.toString(),
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.status(201).json({
    success: true,
    data: getUserResponse(user, accessToken, refreshToken),
  });
}

export async function login(req: AuthenticatedRequest, res: Response) {
  const { email, password } = req.body;

  const user = await userRepository.model.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account is deactivated');
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'> = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    vendorProfileId: user.vendorProfile?.toString(),
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.json({
    success: true,
    data: getUserResponse(user, accessToken, refreshToken),
  });
}

export async function refresh(req: AuthenticatedRequest, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token required');
  }

  try {
    const { verifyRefreshToken } = await import('../utils/jwt.js');
    const payload = verifyRefreshToken(refreshToken);
    if (payload.type !== 'refresh') {
      throw ApiError.unauthorized('Invalid token type');
    }

    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or deactivated');
    }

    const newPayload: Omit<JwtPayload, 'type' | 'iat' | 'exp'> = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      vendorProfileId: user.vendorProfile?.toString(),
    };

    const accessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }
}

export async function logout(_req: AuthenticatedRequest, res: Response) {
  // In a production app, you'd invalidate the refresh token in a blacklist/Redis
  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
}

export async function me(req: AuthenticatedRequest, res: Response) {
  const user = await userRepository.findById(req.user.sub);
  if (!user) {
    throw ApiError.notFound('User not found');
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