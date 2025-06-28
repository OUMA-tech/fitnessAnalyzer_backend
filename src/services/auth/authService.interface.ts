import { UserMapper } from '../../mappers/user/userMapper';
import { RegisterDTO } from '../../interfaces/dto/registerDTO';
import { LoginDTO } from '../../interfaces/dto/loginDTO';
import { JwtConfig } from '../../config';
import { SubscriptionService } from '../subscription/subscriptionService.interface';
import { VerificationService } from '../verification/verificationService.interface';
import { UserDto } from '../../interfaces/entity/user';

import { SubscriptionDto } from '../../interfaces/entity/subscription';

export interface LoginResponse {
  user: UserDto;
  token: string;
  subscription: SubscriptionDto|null;
}

export interface AuthServiceDependencies {
  userMapper: UserMapper;
  jwtConfig: JwtConfig;
  subscriptionService: SubscriptionService;
  verificationService: VerificationService;
}

export interface AuthService {
    register(userData: RegisterDTO): Promise<UserDto>;
    login(credentials: LoginDTO): Promise<LoginResponse>;
    sendVerificationCode(email: string, type: 'verification' | 'password_reset'): Promise<boolean>;
}