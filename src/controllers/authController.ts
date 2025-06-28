import { Request, Response } from 'express';
import User from '../models/userModel';
import { AuthService } from '../services/auth/authService.interface';


export const createAuthController = (authService: AuthService) => {

  return {
    register: async (req: Request, res: Response) => {
      try {
        const { username, email, password, verificationCode } = req.body;
        const user = await authService.register({ username, email, password, verificationCode, type: 'verification' });
        res.status(201).json({ message: 'User registered successfully!' });
      } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
      }
    },
    login: async (req: Request, res: Response) => {
      try {
        const { email, password } = req.body;
        const { user, token, subscription } = await authService.login({ email, password });
        res.status(200).json({
          message: 'Login successful!',
          token,
          user: {
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
          isAuthStrava: user.isAuthStrava,
        },
        subscription,
      });
      } catch (error) {
          console.error('Login error:', (error as Error).message);
          res.status(500).json({ message: 'Error logging in' });
      }    

    },
    sendEmailVerificationCode: async (req: Request, res: Response): Promise<void> => {
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
        const sent = await authService.sendVerificationCode(email, 'verification');
        if (sent) {
          res.status(200).json({ message: 'Verification code sent' });
        } else {
          res.status(500).json({ message: 'Failed to send verification code' });
        }
      } catch (error) {
        console.error('Error in sendEmailVerification:', error);
        res.status(500).json({ message: 'Server error' });
      }
    }
  };
};


