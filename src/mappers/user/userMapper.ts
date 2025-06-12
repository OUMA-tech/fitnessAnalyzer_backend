import { RegisterDTO } from '../../interfaces/dto/registerDTO';
import { UserModel } from '../../models/userModel';

export interface UserMapper {
    findById(id: string): Promise<UserModel | null>;
    findByEmail(email: string): Promise<UserModel | null>;
    findByStravaAthleteId(athleteId: string): Promise<UserModel | null>;
    create(user: RegisterDTO): Promise<UserModel>;
    update(user: UserModel): Promise<UserModel | null>;
    delete(id: string): Promise<boolean>;
    updateUser(userId: string, user: Partial<UserModel>): Promise<UserModel | null>;
  }