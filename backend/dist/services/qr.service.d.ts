export interface QRCodeData {
    orderId: string;
    token: string;
    timestamp: number;
    hmac: string;
}
export interface QRCodeOptions {
    width?: number;
    margin?: number;
    color?: {
        dark: string;
        light: string;
    };
}
export declare class QRService {
    private readonly secret;
    private readonly tokenExpiryMs;
    constructor(secret: string, tokenExpiryMinutes?: number);
    generateToken(orderId: string): string;
    verifyToken(qrData: string): {
        valid: boolean;
        orderId?: string;
        error?: string;
    };
    generateQRCodeImage(qrData: string, options?: QRCodeOptions): Promise<string>;
    generateQRCodeSVG(qrData: string, options?: QRCodeOptions): Promise<string>;
}
export declare const createQRService: () => QRService;
//# sourceMappingURL=qr.service.d.ts.map