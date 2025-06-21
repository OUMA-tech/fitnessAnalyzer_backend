import { Model } from 'mongoose';
import { UserModel } from '../../models/userModel';
import { UserMapper } from './userMapper';
import { toClient } from '../../utils/toClient';
export const createMongoUserMapper = (UserModel: Model<UserModel>): UserMapper => {
  return {
    async findById(id) {
      const user = await UserModel.findById(id).lean();
      return user ? toClient(user) : null;
    },
    async findByEmail(email) {
      const user = await UserModel.findOne({ email }).lean();
      return user ? toClient(user) : null;
    },
    async findByStravaAthleteId(athleteId) {
      const user = await UserModel.findOne({ 'strava.athleteId': athleteId }).lean();
      return user ? toClient(user) : null;
    },
    async create(user) {
      const newUser = await UserModel.create(user);
      return toClient(newUser);
    },

    async delete(id) {
      const result = await UserModel.findByIdAndDelete(id);
      return result !== null;
    },
    async updateUser(user) {
      const updatedUser = await UserModel.findByIdAndUpdate(user.id, user, { new: true });
      return updatedUser ? toClient(updatedUser) : null;
    },
    async getUserByStripeCustomerId(customerId) {
      const user = await UserModel.findOne({ 'stripeCustomerId': customerId });
      return user ? toClient(user) : null;
    },
  };
};
