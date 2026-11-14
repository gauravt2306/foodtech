import crypto from 'crypto';
import QRCode from 'qrcode';

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

export class QRService {
  private readonly secret: string;
  private readonly tokenExpiryMs: number;

  constructor(secret: string, tokenExpiryMinutes = 30) {
    this.secret = secret;
    this.tokenExpiryMs = tokenExpiryMinutes * 60 * 1000;
  }

  generateToken(orderId: string): string {
    const timestamp = Date.now();
    const payload = `${orderId}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
    return Buffer.from(JSON.stringify({ orderId, token: payload, timestamp, hmac })).toString('base64');
  }

  verifyToken(qrData: string): { valid: boolean; orderId?: string; error?: string } {
    try {
      const decoded = JSON.parse(Buffer.from(qrData, 'base64').toString()) as QRCodeData;
      const { orderId, token, timestamp, hmac } = decoded;

      if (Date.now() - timestamp > this.tokenExpiryMs) {
        return { valid: false, error: 'QR code expired' };
      }

      const expectedHmac = crypto.createHmac('sha256', this.secret).update(token).digest('hex');
      if (hmac !== expectedHmac) {
        return { valid: false, error: 'Invalid QR code signature' };
      }

      return { valid: true, orderId };
    } catch {
      return { valid: false, error: 'Invalid QR code format' };
    }
  }

  async generateQRCodeImage(qrData: string, options: QRCodeOptions = {}): Promise<string> {
    const {
      width = 300,
      margin = 2,
      color = { dark: '#1E293B', light: '#F8FAFC' },
    } = options;

    return QRCode.toDataURL(qrData, {
      width,
      margin,
      color,
      errorCorrectionLevel: 'M',
    });
  }

  async generateQRCodeSVG(qrData: string, options: QRCodeOptions = {}): Promise<string> {
    const {
      width = 300,
      margin = 2,
      color = { dark: '#1E293B', light: '#F8FAFC' },
    } = options;

    return QRCode.toString(qrData, {
      type: 'svg',
      width,
      margin,
      color,
      errorCorrectionLevel: 'M',
    });
  }
}

export const createQRService = (): QRService => {
  const secret = process.env.QR_SECRET || process.env.JWT_SECRET || 'default-qr-secret-change-in-production';
  return new QRService(secret);
};