import { UserDto } from "../entity/user";

export interface LoginVO {
    message: string;
    token: string;
    user: UserDto;
}
