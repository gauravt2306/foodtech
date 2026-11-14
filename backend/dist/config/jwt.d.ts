export declare const jwtConfig: {
    readonly secret: string;
    readonly expiresIn: string;
    readonly refreshSecret: string;
    readonly refreshExpiresIn: string;
};
export type JwtPayload = {
    sub: string;
    email: string;
    role: 'superadmin' | 'vendor' | 'employee';
    vendorProfileId?: string;
    type: 'access' | 'refresh';
    iat?: number;
    exp?: number;
};
//# sourceMappingURL=jwt.d.ts.map