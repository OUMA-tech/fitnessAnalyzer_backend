import { UserModel } from "../entity/user";

export interface LoginVO {
    message: string;
    token: string;
    user: UserModel;
}
