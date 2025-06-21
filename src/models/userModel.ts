import mongoose, { Schema, Document, Types } from 'mongoose';

export interface UserModel extends Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    profileImage?: string;         
    role?: 'user' | 'admin';  
    avatar?: string;     
    createdAt?: Date;              
    updatedAt?: Date;              
    lastLogin?: Date;              
    status?: 'active' | 'banned';  
    address?: string;              
    phoneNumber?: string;  
    isAuthStrava: boolean; 
    isEmailVerified: boolean;
    stripeCustomerId?: string;
    strava: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
      athleteId: number;
    }       
  }

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

userSchema.set('toJSON', {
  virtuals: true,        // 启用虚拟属性（例如 id）
  versionKey: false,     // 删除 __v
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

userSchema.set('toObject', {
  virtuals: true,        // 启用虚拟属性（例如 id）
  versionKey: false,     // 删除 __v
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

userSchema.index({email: 'text'});

export default mongoose.model<UserModel>('User', userSchema);
