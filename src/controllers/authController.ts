import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { UserModel } from '../models/userModel';
import { returnSignedCookies } from '../utils/AWS';
import { generateToken } from '../utils/auth';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password } = req.body;
  
      // check whether user already existed
      const existingUser: UserModel | null = await User.findOne({ email });

      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }
  
      // password encrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // create and save user
      await User.create({
        username,
        email,
        password: hashedPassword,
      });
      
      res.status(201).json({ message: 'User registered successfully!' });
    } catch (error: unknown) {
        if (error instanceof Error) {  
            console.error('Registration error:', error.message);
          } else {
            console.error('Registration error: Unknown error');
          }
        res.status(500).json({ message: 'Error registering user' });
    }
};

export const loginUser = async (req: Request, res: Response):Promise<void>=> {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required.' });
            return ;
          }
      
          // get user
          const user = await User.findOne({ email });
          if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return ;
          }
      
          // check password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid password.' });
            return ;
          }
          // generate JWT Token
          const token = generateToken(user);

        // login success
        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
            userId: user._id,
            username: user.username,
            avatar: user.avatar,
            email: user.email,
            role: user.role,
            lastLogin: user.lastLogin,
            isAuthStrava: user.isAuthStrava,
            },
        });
    } catch (error) {
        console.error('Login error:', (error as Error).message);
        res.status(500).json({ message: 'Error logging in' });
    }    
};


export const getProfile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(404).json({ message: 'User not found' });
        return ;
    }
  
    res.json({
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      profileImage: req.user.profileImage,
      role: req.user.role,
      status: req.user.status,
    });
  };

export const getCookies = async(req:Request, res:Response):Promise<void> => {
  const cookies = returnSignedCookies();
  console.log(cookies);
  res.cookie('CloudFront-Key-Pair-Id', cookies['CloudFront-Key-Pair-Id'], {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none', // <== Must be 'None' for cross-site cookies
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
  });
  
  
  res.cookie('CloudFront-Signature', cookies['CloudFront-Signature'], {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  res.cookie('CloudFront-Expires', cookies['CloudFront-Expires'], {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
  
  res.json({ message: 'Cookies set successfully' });
  
}
