import { Request } from 'express';
import { UserModel } from '../models/userModel';

export interface AuthRequest extends Request {
  user?: UserModel;
}