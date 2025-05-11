import mongoose, { Schema, Document } from 'mongoose';

export interface UserModel extends Document {
  username: string;
  email: string;
  password: string;
  profileImage?: string;         // 头像地址
  role?: 'user' | 'admin';       // 角色管理
  createdAt?: Date;              // 注册时间
  updatedAt?: Date;              // 更新时间
  lastLogin?: Date;              // 最后登录时间
  status?: 'active' | 'banned';  // 账户状态
  address?: string;              // 地址信息
  phoneNumber?: string;          // 电话
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
