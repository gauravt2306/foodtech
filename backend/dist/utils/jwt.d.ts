import { JwtPayload } from '../config/jwt';
export declare function generateAccessToken(payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'>): string;
export declare function generateRefreshToken(payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'>): string;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function verifyRefreshToken(token: string): JwtPayload;
export declare function decodeToken(token: string): JwtPayload | null;
export declare function extractTokenFromHeader(authHeader: string | undefined): string | null;
//# sourceMappingURL=jwt.d.ts.map