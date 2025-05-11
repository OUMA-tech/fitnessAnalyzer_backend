import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

interface JwtPayload {
  userId: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  console.log('✅ protect middleware executed');
  let token;

  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // get Token
      token = req.headers.authorization.split(' ')[1];

      // verify Token 
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      // return {
      //   userId: '681c28f283da1d8a565946d9',
      //   email: 'john@example.com',
      //   role: 'user',
      //   iat: 1746689337,
      //   exp: 1746692937
      // }

      // check whether user is active
      const user = await User.findById(decoded.userId).select('-password');
      // return {
      //   _id: new ObjectId('681c28f283da1d8a565946d9'),
      //   username: 'john_doe',
      //   email: 'john@example.com',
      //   role: 'user',
      //   status: 'active',
      //   createdAt: 2025-05-08T03:45:54.606Z,
      //   updatedAt: 2025-05-08T03:45:54.606Z,
      //   __v: 0
      // }

      if (!user || user.status !== 'active') {
        res.status(403).json({ message: 'User is not active' });
        return ;
      }
      
      req.user = user;
      console.log("success");
      next();
    } catch (error) {
      console.error('Authentication error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
        return ;
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
    return ;
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction):void => {
  const user = req.user;
  if (user && user.role === 'admin') {
    next();
  }
  res.status(403).json({ message: 'need admin authorized' });
  return ;
};