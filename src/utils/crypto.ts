import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
// console.log(process.env.TOKEN_SECRET_KEY);
const key = Buffer.from(process.env.TOKEN_SECRET_KEY!, 'hex'); // 32 bytes
const iv = Buffer.from(process.env.TOKEN_IV!, 'hex'); // 16 bytes

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

export function decrypt(encrypted: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}
