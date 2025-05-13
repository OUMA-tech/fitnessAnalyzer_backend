import { Request, Response, NextFunction } from 'express';

export function extractToken(req: Request, res: Response, next: NextFunction):void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.query.state) {
    token = req.query.state.toString();
  }

  if (!token) {
    res.status(401).json({ message: 'Missing authentication token' });
    return ;
  }

  (req as any).token = token;
  next();
}
