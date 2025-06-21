import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { sendVerificationCode, verifyCode } from '../services/verification/verificationService';

export const sendEmailVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email: string };
    
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    
    // 检查邮箱是否已被注册
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }
    
    // 发送验证码
    const sent = await sendVerificationCode(email);
    if (sent) {
      res.status(200).json({ message: 'Verification code sent' });
    } else {
      res.status(500).json({ message: 'Failed to send verification code' });
    }
  } catch (error) {
    console.error('Error in sendEmailVerification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, verificationCode } = req.body as { 
      email: string; 
      password: string; 
      verificationCode: string;
    };
    
    // 验证必填字段
    if (!email || !password || !verificationCode) {
      res.status(400).json({ message: 'Email, password and verification code are required' });
      return;
    }
    
    // 检查邮箱是否已被注册
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }
    
    // 验证验证码
    const isCodeValid = await verifyCode(email, verificationCode);
    if (!isCodeValid) {
      res.status(400).json({ message: 'Invalid or expired verification code' });
      return;
    }
    
    // 创建新用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      isEmailVerified: true,
      username: email.split('@')[0], // 默认使用邮箱前缀作为用户名
      isAuthStrava: false
    });
    
    await user.save();
    
    // 生成JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 