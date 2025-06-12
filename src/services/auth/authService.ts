import bcrypt from 'bcrypt';

import { AuthService, AuthServiceDependencies, LoginResponse } from './authService.interface';
import { UserModel } from '../../models/userModel';
import { RegisterDTO } from '../../interfaces/dto/registerDTO';
import { LoginDTO } from '../../interfaces/dto/loginDTO';
import { signPayload } from '../../utils/jwt';
// import { createSubscription } from './subscription.service';
// import { DEFAULT_SUBSCRIPTION } from '../constants';

export const createAuthService =(dependencies: AuthServiceDependencies): AuthService => {
    const { userMapper, jwtConfig, subscriptionService, verificationService } = dependencies;
    return {
      register: async (userData: RegisterDTO): Promise<UserModel> => {
        const existingUser = await userMapper.findByEmail(userData.email);
        if (existingUser) {
        throw new Error('User already exists');
      }
      const isCodeValid = await verificationService.verifyCode(userData.email, userData.verificationCode);
      if (!isCodeValid) {
        throw new Error('Invalid or expired verification code');
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const user = await userMapper.create({
        ...userData,
        password: hashedPassword,
      });
      //  create subscription
      await subscriptionService.createSubscription(user.id);

      return user;
    },

    login: async (userData: LoginDTO): Promise<LoginResponse> => {
      const user = await userMapper.findByEmail(userData.email);
      if (!user) {
        throw new Error('User not found');
      }

      const isPasswordValid = await bcrypt.compare(userData.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      const token = signPayload(user, jwtConfig.secret, jwtConfig.expiresIn);

      const subscription = await subscriptionService.getUserSubscription(user.id);
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      return { user, token, subscriptionId: subscription.id };
    },

    sendVerificationCode: async (email: string): Promise<boolean> => {
      try {
        if (!email) {
          throw new Error('Email is required');
        }
        const existingUser = await userMapper.findByEmail(email);
        if (existingUser) {
          throw new Error('Email already registered');
        }
        const sent = await verificationService.sendVerificationCode(email, 'verification');
        if (sent) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error in sendEmailVerification:', error);
        return false;
      }
    }
  };
}
