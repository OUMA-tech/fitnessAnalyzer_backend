import { StravaActivityModel } from "../../models/stravaActivityModel";
import { StravaActivityMapper } from "../../mappers/stravaActivity/stravaActivityMapper";
import { UserMapper } from "../../mappers/user/userMapper";

export interface StravaService {
    getStravaActivities: (page: number, pageSize: number, filter: string) => Promise<{activities: StravaActivityModel[]; total: number}>;
    // fetchStravaActivities: (accessToken:string,userId:string) => Promise<void>;
    // refreshStravaToken: (user:UserModel,refreshToken:string) => Promise<string>;
    handleStravaAuthCallback: (code:string, userId:string) => Promise<void>;
    handleStravaWebHook: (event:any) => Promise<void>;
}

export interface StravaServiceDependencies {
    stravaActivityMapper: StravaActivityMapper;
    userMapper: UserMapper;
}
