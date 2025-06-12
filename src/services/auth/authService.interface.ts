import { UserModel } from '../../models/userModel';
import { UserMapper } from '../../mappers/user/userMapper';
import { RegisterDTO } from '../../interfaces/dto/registerDTO';
import { LoginDTO } from '../../interfaces/dto/loginDTO';
import { JwtConfig } from '../../config';
import { SubscriptionService } from '../subscription/subscriptionService.interface';
import { VerificationService } from '../verification/verificationService.interface';

export interface LoginResponse {
  user: UserModel;
  token: string;
  subscriptionId: string;
}

export interface AuthServiceDependencies {
  userMapper: UserMapper;
  jwtConfig: JwtConfig;
  subscriptionService: SubscriptionService;
  verificationService: VerificationService;
}

export interface AuthService {
    register(userData: RegisterDTO): Promise<UserModel>;
    login(credentials: LoginDTO): Promise<LoginResponse>;
    sendVerificationCode(email: string): Promise<boolean>;
}