import bcrypt from 'bcrypt';
import { createSubscription } from '../stripeService';
import { AuthService, AuthServiceDependencies, LoginResponse } from './authService.interface';
import { UserModel } from '../../interfaces/entity/user';
import { RegisterDTO } from '../../interfaces/dto/registerDTO';
import { LoginDTO } from '../../interfaces/dto/loginDTO';
import { signPayload } from '../../utils/jwt';
// import { createSubscription } from './subscription.service';
// import { DEFAULT_SUBSCRIPTION } from '../constants';

export const createAuthService =(dependencies: AuthServiceDependencies): AuthService => {
    const { userMapper, jwtConfig, subscriptionService } = dependencies;
    return {
      register: async (userData: RegisterDTO): Promise<UserModel> => {
        const existingUser = await userMapper.findByEmail(userData.email);
        if (existingUser) {
        throw new Error('User already exists');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const user = await userMapper.create({
        ...userData,
        password: hashedPassword,
      });
  // TODO create subscription
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

      return { user, token };
    },

  };
}
