export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly errors?: Record<string, string[]>;
    constructor(statusCode: number, message: string, errors?: Record<string, string[]>, isOperational?: boolean);
    static badRequest(message?: string, errors?: Record<string, string[]>): ApiError;
    static unauthorized(message?: string): ApiError;
    static forbidden(message?: string): ApiError;
    static notFound(message?: string): ApiError;
    static conflict(message?: string): ApiError;
    static internal(message?: string): ApiError;
    static tooManyRequests(message?: string): ApiError;
}
export declare const errorCodes: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR";
    readonly AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly CONFLICT: "CONFLICT";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
    readonly TOKEN_INVALID: "TOKEN_INVALID";
};
//# sourceMappingURL=ApiError.d.ts.map