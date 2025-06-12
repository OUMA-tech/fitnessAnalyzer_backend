import { StravaActivityModel } from "../../models/stravaActivityModel";
import { UserModel } from "../../models/userModel";
import { StravaActivityMapper } from "../../mappers/stravaActivityMapper.ts/stravaActivityMapper";
import { UserMapper } from "../../mappers/user/userMapper";

export interface StravaService {
    getStravaActivities: (page: number, pageSize: number, filter: string) => Promise<{activities: StravaActivityModel[]; total: number}>;
    fetchStravaActivities: (accessToken:string,userId:string) => Promise<void>;
    // refreshStravaToken: (user:UserModel,refreshToken:string) => Promise<string>;
    handleStravaAuthCallback: (code:string, userId:string) => Promise<void>;
    handleStravaWebHook: (user:UserModel,activityId:string) => Promise<void>;
}

export interface StravaServiceDependencies {
    stravaActivityMapper: StravaActivityMapper;
    userMapper: UserMapper;
}
