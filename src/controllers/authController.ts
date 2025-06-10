import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/userModel';
import { returnSignedCookies } from '../utils/AWS';
import { generateToken } from '../utils/jwt';
import Subscription from '../models/subscriptionModel';
import { UserModel } from '../interfaces/entity/user';
import { AuthService } from '../services/auth/authService.interface';

const DEFAULT_SUBSCRIPTION = {
  status: 'free',
  planId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false
};

export const createAuthController = (authService: AuthService) => {

  return {
    register: async (req: Request, res: Response) => {
      try {
        const { username, email, password } = req.body;
        const user = await authService.register({ username, email, password });
        res.status(201).json({ message: 'User registered successfully!' });
      } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
      }
    },
    login: async (req: Request, res: Response) => {
      try {
        const { email, password } = req.body;
        const user = await authService.login({ email, password });
        res.status(200).json(user);
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
      }

    }
  };
};

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
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      // const subscription = await createSubscription({
      //   userId: user.id,
      //   ...DEFAULT_SUBSCRIPTION
      // });
      
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
          const token = generateToken(user, jwtConfig);

          // get subscription
          const subscription = await Subscription.findOne({ userId: user._id });

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
            subscription,
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

