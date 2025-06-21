import { Document } from 'mongoose';

export interface UserDto {
    id: string;
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