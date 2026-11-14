import jwt, { SignOptions } from 'jsonwebtoken';
import { jwtConfig, JwtPayload } from '../config/jwt';

const signOptions: SignOptions = { algorithm: 'HS256' };

export function generateAccessToken(payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    jwtConfig.secret,
    { ...signOptions, expiresIn: jwtConfig.expiresIn as SignOptions['expiresIn'] }
  );
}

export function generateRefreshToken(payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    jwtConfig.refreshSecret,
    { ...signOptions, expiresIn: jwtConfig.refreshExpiresIn as SignOptions['expiresIn'] }
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, jwtConfig.secret, { algorithms: ['HS256'] }) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, jwtConfig.refreshSecret, { algorithms: ['HS256'] }) as JwtPayload;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}