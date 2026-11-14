"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQRService = exports.QRService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const qrcode_1 = __importDefault(require("qrcode"));
class QRService {
    secret;
    tokenExpiryMs;
    constructor(secret, tokenExpiryMinutes = 30) {
        this.secret = secret;
        this.tokenExpiryMs = tokenExpiryMinutes * 60 * 1000;
    }
    generateToken(orderId) {
        const timestamp = Date.now();
        const payload = `${orderId}:${timestamp}`;
        const hmac = crypto_1.default.createHmac('sha256', this.secret).update(payload).digest('hex');
        return Buffer.from(JSON.stringify({ orderId, token: payload, timestamp, hmac })).toString('base64');
    }
    verifyToken(qrData) {
        try {
            const decoded = JSON.parse(Buffer.from(qrData, 'base64').toString());
            const { orderId, token, timestamp, hmac } = decoded;
            if (Date.now() - timestamp > this.tokenExpiryMs) {
                return { valid: false, error: 'QR code expired' };
            }
            const expectedHmac = crypto_1.default.createHmac('sha256', this.secret).update(token).digest('hex');
            if (hmac !== expectedHmac) {
                return { valid: false, error: 'Invalid QR code signature' };
            }
            return { valid: true, orderId };
        }
        catch {
            return { valid: false, error: 'Invalid QR code format' };
        }
    }
    async generateQRCodeImage(qrData, options = {}) {
        const { width = 300, margin = 2, color = { dark: '#1E293B', light: '#F8FAFC' }, } = options;
        return qrcode_1.default.toDataURL(qrData, {
            width,
            margin,
            color,
            errorCorrectionLevel: 'M',
        });
    }
    async generateQRCodeSVG(qrData, options = {}) {
        const { width = 300, margin = 2, color = { dark: '#1E293B', light: '#F8FAFC' }, } = options;
        return qrcode_1.default.toString(qrData, {
            type: 'svg',
            width,
            margin,
            color,
            errorCorrectionLevel: 'M',
        });
    }
}
exports.QRService = QRService;
const createQRService = () => {
    const secret = process.env.QR_SECRET || process.env.JWT_SECRET || 'default-qr-secret-change-in-production';
    return new QRService(secret);
};
exports.createQRService = createQRService;
//# sourceMappingURL=qr.service.js.map