import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtConfig } from '../config';
import { UserMapper } from '../mappers/user/userMapper';

interface JwtPayload {
  id: string;
}


export const createAuthMiddleware = (jwtConfig: JwtConfig, userMapper:UserMapper) => {
  return{
    protect: async (req: Request, res: Response, next: NextFunction):Promise<void> => {
      console.log('✅ protect middleware executed');
      const token = (req as any).token;
    
      if (token) {
        try {
          // verify Token 
          const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    
          // console.log(decoded)
          // check whether user is active
          const user = await userMapper.findById(decoded.id);
          // console.log(user);
    
          if (!user || user.status !== 'active') {
            res.status(403).json({ message: 'User is not active' });
            return ;
          }
          req.user = user;
          next();
        } catch (error) {
          console.error('Authentication error:', error);
            res.status(401).json({ message: 'Unauthorized please login again' });
            return ;
        }
      } else {
        console.log('❌ No token provided');
        res.status(401).json({ message: 'Unauthorized please login' });
        return ;
      }
    },
    isAdmin: (req: Request, res: Response, next: NextFunction):void => {
      const user = req.user;
      if (user && user.role === 'admin') {
        next();
      }
      res.status(403).json({ message: 'need admin authorized' });
      return ;
    },
  }
}