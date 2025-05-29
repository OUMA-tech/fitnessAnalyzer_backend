import { UserModel } from "../models/userModel";
import jwt from 'jsonwebtoken';

export const generateToken = (user: UserModel): string => {
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' } // Token expired in one hour
  );
    return token;
  }