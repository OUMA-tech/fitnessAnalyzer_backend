import mongoose, { Schema, Document } from 'mongoose';

export interface UserModel extends Document {
  username: string;
  email: string;
  password: string;
  profileImage?: string;         
  role?: 'user' | 'admin';       
  createdAt?: Date;              
  updatedAt?: Date;              
  lastLogin?: Date;              
  status?: 'active' | 'banned';  
  address?: string;              
  phoneNumber?: string;  
  isAuthStrava: boolean; 
  strava:{
    accessToken: string,
    refreshToken: string,
    expiresAt: number,       // Unix 时间戳，token 到期时间
    athleteId: number  
  }       
}

const userSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String },
  role: { type: String, default: 'user' },
  lastLogin: { type: Date },
  status: { type: String, default: 'active' },
  address: { type: String },
  phoneNumber: { type: String },
  isAuthStrava: { type: Boolean, default: false},
  strava: {
    accessToken: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Number },
    athleteId: { type: Number },
  },
}, { timestamps: true });

userSchema.index({email: 'text'});
export default mongoose.model<UserModel>('User', userSchema);
