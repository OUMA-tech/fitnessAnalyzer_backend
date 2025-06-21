import { Request } from 'express';
import { UserDto } from '../interfaces/entity/user';

export interface AuthRequest extends Request {
  user?: UserDto;
}