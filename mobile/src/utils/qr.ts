// Simple base64 encoding/decoding for React Native
// Using a pure JS implementation to avoid Buffer/TextEncoder dependencies

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function base64Encode(str: string): string {
  let output = '';
  let i = 0;
  const bytes = utf8Encode(str);

  while (i < bytes.length) {
    const byte1 = bytes[i++];
    const byte2 = i < bytes.length ? bytes[i++] : 0;
    const byte3 = i < bytes.length ? bytes[i++] : 0;

    const enc1 = byte1 >> 2;
    const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
    const enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
    const enc4 = byte3 & 63;

    output += chars[enc1] + chars[enc2] + chars[(i - 1 >= bytes.length ? 64 : enc3)] + chars[(i >= bytes.length ? 64 : enc4)];
  }

  return output;
}

function base64Decode(str: string): string {
  let output = '';
  let i = 0;

  str = str.replace(/[^A-Za-z0-9+/=]/g, '');

  while (i < str.length) {
    const enc1 = chars.indexOf(str.charAt(i++));
    const enc2 = chars.indexOf(str.charAt(i++));
    const enc3 = chars.indexOf(str.charAt(i++));
    const enc4 = chars.indexOf(str.charAt(i++));

    const byte1 = (enc1 << 2) | (enc2 >> 4);
    const byte2 = ((enc2 & 15) << 4) | (enc3 >> 6);
    const byte3 = ((enc3 & 3) << 6) | enc4;

    output += String.fromCharCode(byte1);

    if (enc3 !== 64) {
      output += String.fromCharCode(byte2);
    }
    if (enc4 !== 64) {
      output += String.fromCharCode(byte3);
    }
  }

  return utf8Decode(output);
}

function utf8Encode(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      bytes.push(charCode);
    } else if (charCode < 0x800) {
      bytes.push(0xC0 | (charCode >> 6));
      bytes.push(0x80 | (charCode & 0x3F));
    } else if (charCode < 0x10000) {
      bytes.push(0xE0 | (charCode >> 12));
      bytes.push(0x80 | ((charCode >> 6) & 0x3F));
      bytes.push(0x80 | (charCode & 0x3F));
    } else {
      bytes.push(0xF0 | (charCode >> 18));
      bytes.push(0x80 | ((charCode >> 12) & 0x3F));
      bytes.push(0x80 | ((charCode >> 6) & 0x3F));
      bytes.push(0x80 | (charCode & 0x3F));
    }
  }
  return bytes;
}

function utf8Decode(bytes: string): string {
  let result = '';
  let i = 0;
  while (i < bytes.length) {
    const byte1 = bytes.charCodeAt(i++);
    if (byte1 < 0x80) {
      result += String.fromCharCode(byte1);
    } else if ((byte1 & 0xE0) === 0xC0) {
      const byte2 = bytes.charCodeAt(i++);
      result += String.fromCharCode(((byte1 & 0x1F) << 6) | (byte2 & 0x3F));
    } else if ((byte1 & 0xF0) === 0xE0) {
      const byte2 = bytes.charCodeAt(i++);
      const byte3 = bytes.charCodeAt(i++);
      result += String.fromCharCode(((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F));
    } else if ((byte1 & 0xF8) === 0xF0) {
      const byte2 = bytes.charCodeAt(i++);
      const byte3 = bytes.charCodeAt(i++);
      const byte4 = bytes.charCodeAt(i++);
      const codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F);
      result += String.fromCodePoint(codePoint);
    }
  }
  return result;
}

export interface QRTokenPayload {
  orderId: string;
  employeeId: string;
  timestamp: number;
  nonce: string;
}

export function generateQRToken(payload: QRTokenPayload): string {
  return base64Encode(JSON.stringify(payload));
}

export function parseQRToken(token: string): QRTokenPayload | null {
  try {
    const decoded = base64Decode(token);
    return JSON.parse(decoded) as QRTokenPayload;
  } catch {
    return null;
  }
}

export function isQRTokenValid(token: string, maxAgeMs = 30000): boolean {
  const payload = parseQRToken(token);
  if (!payload) return false;

  const age = Date.now() - payload.timestamp;
  return age <= maxAgeMs;
}

// Simple HMAC-like function (for future use with expo-crypto)
export async function generateHMAC(payload: string, secret: string): Promise<string> {
  // This would use expo-crypto in a real implementation
  // For now, return a simple hash
  let hash = 0;
  const str = payload + secret;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export async function verifyHMAC(payload: string, secret: string, hmac: string): Promise<boolean> {
  const expected = await generateHMAC(payload, secret);
  return expected === hmac;
}