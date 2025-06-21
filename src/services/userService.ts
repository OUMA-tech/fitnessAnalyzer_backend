import { UserMapper } from "../mappers/user/userMapper";
import { UserModel } from "../models/userModel";

export const createUserService = (mapper: UserMapper) => ({
    getUser: async (id: string) => {
      return await mapper.findById(id); 
    },
    createUser: async (user: UserModel) => {
      return await mapper.create(user);
    },
    
  });