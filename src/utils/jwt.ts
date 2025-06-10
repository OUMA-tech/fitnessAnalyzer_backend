import jwt from 'jsonwebtoken';

export const signPayload = (payload: any, secret: string, expiresIn: number) => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};
