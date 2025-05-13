// types/express.d.ts
import type { UserModel } from '../src/models/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: UserModel;
    }
  }
}
export {};