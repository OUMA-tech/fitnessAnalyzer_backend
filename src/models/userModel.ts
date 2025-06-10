import mongoose, { Schema } from 'mongoose';
import { UserModel } from '../interfaces/entity/user';

const userSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  profileImage: { type: String },
  role: { type: String, default: 'user' },
  lastLogin: { type: Date },
  status: { type: String, default: 'active' },
  address: { type: String },
  phoneNumber: { type: String },
  isAuthStrava: { type: Boolean, default: false},
  isEmailVerified: { type: Boolean, default: false },
  stripeCustomerId: { type: String, sparse: true },
  strava: {
    accessToken: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Number },
    athleteId: { type: Number },
  },
}, { timestamps: true });

userSchema.index({email: 'text'});

export default mongoose.model<UserModel>('User', userSchema);
