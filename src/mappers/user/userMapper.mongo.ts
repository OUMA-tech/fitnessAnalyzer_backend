import { Model } from 'mongoose';
import { UserModel } from '../../interfaces/entity/user';
import { UserMapper } from './userMapper';

export const createMongoUserMapper = (UserModel: Model<UserModel>): UserMapper => {
  return {
    async findById(id) {
      return await UserModel.findById(id);
    },
    async findByEmail(email) {
      return await UserModel.findOne({ email });
    },
    async findByStravaAthleteId(athleteId) {
      return await UserModel.findOne({ 'strava.athleteId': athleteId });
    },
    async create(user) {
      return await UserModel.create(user);
    },
    async update(user) {
      return await UserModel.findByIdAndUpdate(user._id, user, { new: true });
    },
    async delete(id) {
      const result = await UserModel.findByIdAndDelete(id);
      return result !== null;
    },
    async updateUser(userId: string, user: Partial<UserModel>) {
      return await UserModel.findByIdAndUpdate(userId, user, { new: true });
    }
  };
};
