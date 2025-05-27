import { Request, Response, NextFunction } from 'express';
import { encrypt,decrypt } from '../utils/crypto'; // 假设你有一个函数来解密 token
import User, { UserModel } from '../models/userModel';
import axios from 'axios';

export const refreshStravaToken = async (user:UserModel,refreshToken:string) => {
  console.log("refreshing token.............");

  try{
    const response = await axios.post('https://www.strava.com/oauth/token', {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  console.log(response.data);
  const newToken = response.data;

  user.strava.accessToken= encrypt(newToken.access_token),
  user.strava.refreshToken=encrypt(newToken.refresh_token),
  user.strava.expiresAt=newToken.expires_at,

  await user.save();
  return newToken.access_token;
  } catch (err) {
    console.error("request failed", err);
  }
} 

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    console.log("verifying token.........");
    const userId = (req as any).user?.id; 
    const user = await User.findById(userId);

    
    let accessToken;
    if(user){
      const isExpired = Date.now() / 1000 > user.strava.expiresAt;
      if(isExpired){
        accessToken=refreshStravaToken(user,decrypt(user.strava.refreshToken));
      } else{
        const encryptedAccessToken = user.strava.accessToken;
        if (!encryptedAccessToken) {
          res.status(401).json({ message: 'Access token not found' });
          return ;
        }
    
        accessToken = decrypt(encryptedAccessToken);
      }

  
      if (!accessToken) {
        res.status(401).json({ message: 'Invalid access token' });
        return ;
      }
  
      (req as any).accessToken = accessToken; 
      next(); 
    }
  
    
  } catch (error) {
    console.error('Error verifying access token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
