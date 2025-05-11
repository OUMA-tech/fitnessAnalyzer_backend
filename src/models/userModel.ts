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
  phoneNumber: { type: String }
}, { timestamps: true });

userSchema.index({email: 'text'});
export default mongoose.model<UserModel>('User', userSchema);
