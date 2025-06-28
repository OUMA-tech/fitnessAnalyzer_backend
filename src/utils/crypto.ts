import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

export function encrypt(text: string, key: string, iv: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

export function decrypt(encrypted: string, key: string, iv: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}
