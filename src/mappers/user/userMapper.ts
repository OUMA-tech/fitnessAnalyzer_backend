import { RegisterDTO } from '../../interfaces/dto/registerDTO';
import { UserModel } from '../../interfaces/entity/user';

export interface UserMapper {
    findById(id: string): Promise<UserModel | null>;
    findByEmail(email: string): Promise<UserModel | null>;
    create(user: RegisterDTO): Promise<UserModel>;
    update(user: UserModel): Promise<UserModel | null>;
    delete(id: string): Promise<boolean>;
  }