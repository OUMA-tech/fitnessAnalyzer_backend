import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { UserModel } from '../models/userModel';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET||'jwt_secret';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password } = req.body;
  
      // check whether user already existed
      const existingUser: UserModel | null = await User.findOne({ email });

      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return ;
      }
  
      // password encrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // create user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });
  
      // save to db
      await newUser.save();
      
      res.status(201).json({ message: 'User registered successfully!' });
    } catch (error: unknown) {
        if (error instanceof Error) {  
            console.error('Registration error:', error.message);
          } else {
            console.error('Registration error: Unknown error');
          }
        res.status(500).json({ message: 'Internal Server Error' });
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
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expired in one hour
        );
    
        // login success
        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            lastLogin: user.lastLogin,
            },
        });
    } catch (error) {
        console.error('Login error:', (error as Error).message);
        res.status(500).json({ message: 'Internal Server Error' });
    }    
};

declare global {
  namespace Express {
    export interface Request {
      user?: UserModel; 
    }
  }
}

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

