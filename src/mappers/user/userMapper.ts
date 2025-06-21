import { RegisterDTO } from '../../interfaces/dto/registerDTO';
import { UserModel } from '../../models/userModel';
import { UserDto } from '../../interfaces/entity/user';

export interface UserMapper {
    findById(id: string): Promise<UserDto | null>;
    findByEmail(email: string): Promise<UserDto | null>;
    findByStravaAthleteId(athleteId: string): Promise<UserDto | null>;
    create(user: RegisterDTO): Promise<UserDto>;
    // update(user: UserDto): Promise<UserDto | null>;
    delete(id: string): Promise<boolean>;
    updateUser( user: Partial<UserDto>): Promise<UserDto | null>;
    // updateAvatar(userId: string, key: string): Promise<UserDto | null>;
    getUserByStripeCustomerId(customerId: string): Promise<UserDto | null>;
  }