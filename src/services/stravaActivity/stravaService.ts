import axios from "axios";
import { StravaServiceDependencies } from "./stravaService.Interface";
import { UserModel } from "../../models/userModel";
import { decrypt, encrypt } from "../../utils/crypto";
import { StravaActivityMapper } from "../../mappers/stravaActivityMapper.ts/stravaActivityMapper";
import { StravaActivityModel } from "../../models/stravaActivityModel"; 


interface StravaApiActivity {
    id: number;
    name: string;
    type: string;
    distance: number;
    moving_time: number;
    start_date: string;
    average_heartrate?: number;
    elapsed_time: number;
    average_speed: number;
    total_elevation_gain: number;
    kilojoules: number | null;
}

const refreshStravaToken= async (user:UserModel,refreshToken:string) => {
    console.log("refreshing token.............");
  
    try{
      const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    console.log(response.data);
    const newToken = response.data;
  
    user.strava.accessToken= encrypt(newToken.access_token),
    user.strava.refreshToken=encrypt(newToken.refresh_token),
    user.strava.expiresAt=newToken.expires_at,
  
    await user.save();
    return newToken.access_token;
    } catch (err) {
      console.error("request failed", err);
    }
  }

  const verifyAccessToken = async (user:UserModel):Promise<String|null> => {
    try {
      console.log("verifying token.........");
      
      if (!user) return null;

      const isExpired = Date.now() / 1000 > user.strava.expiresAt;
      let accessToken;

      if (isExpired) {
        accessToken = await refreshStravaToken(user, decrypt(user.strava.refreshToken));
      } else {
        const encryptedAccessToken = user.strava.accessToken;
        if (!encryptedAccessToken) {
          return null;
        }
        accessToken = decrypt(encryptedAccessToken);
      }

      return accessToken || null;
    } catch (error) {
      console.error('Error verifying access token:', error);
      return null;
    }
  };

const fetchStravaActivities = async (accessToken:string,userId:string, stravaActivityMapper:StravaActivityMapper)=> {
    console.log("fetching strava activities...........")
    try {
      const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
  
      });

      const records = response.data;
      // console.log(records.length);
      const filteredRecords = records.map((activity:StravaApiActivity) => ({
        userId: userId,
        activityId: activity.id,
        name: activity.name,
        type: activity.type,
        distance: activity.distance,
        movingTime: activity.moving_time,
        elapsedTime: activity.elapsed_time,
        startDate: new Date(activity.start_date), 
        averageSpeed: activity.average_speed,
        averageHeartrate: activity.average_heartrate,
        totalElevationGain: activity.total_elevation_gain,
        calories: activity.kilojoules,
      }));
      console.log(filteredRecords[0]);
      await stravaActivityMapper.insertActivities(filteredRecords);
  
    } catch (error: any) {
      console.error('Error fetching activities:', error.response?.data || error.message);
      throw error;
    }
}

export const createStravaService = (dependencies: StravaServiceDependencies) => {
    const { stravaActivityMapper, userMapper } = dependencies;

    return{
        getStravaActivities: async (page: number, pageSize: number, filter: string) => {
            const {activities, total} = await stravaActivityMapper.findActivitiesWithPagination(page, pageSize, filter);
            return {activities, total};
        },
        


        handleStravaAuthCallback: async (code:string,userId:string):Promise<void> => {
    
            const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
            client_id: process.env.STRAVA_CLIENT_ID,
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            });
            
            // console.log(tokenResponse.data);
            const { access_token, refresh_token, expires_at, athlete } = tokenResponse.data;
            
            await userMapper.updateUser(userId, {
            isAuthStrava: true,
            strava: {
                accessToken: encrypt(access_token),
                refreshToken: encrypt(refresh_token),
                expiresAt: expires_at,
                athleteId: athlete.id,
            },
            });
            await fetchStravaActivities(access_token,userId,stravaActivityMapper);
            
        },

        handleStravaWebHook: async (user:UserModel,activityId:string, aspect:string ) => {
            console.log("handle strava web hook............");
            console.log(user,activityId);
            const accessToken = await verifyAccessToken(user);
        
            const activityResponse = await axios.get(`https://www.strava.com/api/v3/activities/${activityId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            });
        
            const record = activityResponse.data;
            const filteredRecord = {
            userId: user._id,
            activityId: record.id,
            name: record.name,
            type: record.type,
            distance: record.distance,
            movingTime: record.moving_time,
            elapsedTime: record.elapsed_time,
            startDate: new Date(record.start_date),
            averageSpeed: record.average_speed,
            averageHeartrate: record.average_heartrate,
            totalElevationGain: record.total_elevation_gain,
            calories: record.kilojoules,
            } as StravaActivityModel;
            if(aspect === 'create'){
            await stravaActivityMapper.create(
                filteredRecord
            );
            }else if(aspect === 'update'){
            await stravaActivityMapper.updateById(
                record.id,
                filteredRecord
            );
            }else if(aspect === 'delete'){
                await stravaActivityMapper.deleteByActivityId(record.id)
            }
          }
    }

}


