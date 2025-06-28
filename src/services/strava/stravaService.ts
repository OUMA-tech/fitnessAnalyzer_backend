import axios from "axios";
import { StravaServiceDependencies } from "./stravaService.Interface";
import { decrypt, encrypt } from "../../utils/crypto";
import { StravaActivityMapper } from "../../mappers/stravaActivity/stravaActivityMapper";
import { UserMapper } from "../../mappers/user/userMapper";
import { UserDto } from "../../interfaces/entity/user";
import { Types } from "mongoose";
import { CryptoConfig, StravaConfig } from "../../config";

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

const refreshStravaToken= async (user:UserDto,refreshToken:string,userMapper:UserMapper, cryptoConfig: CryptoConfig, stravaConfig: StravaConfig) => {
    console.log("refreshing token.............");
  
    try{
      const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: stravaConfig.clientId,
      client_secret: stravaConfig.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    const newToken = response.data;
    if(!newToken) return null;
  
    await userMapper.updateUser({
      id: user.id,
      strava: {
        accessToken: encrypt(newToken.access_token, cryptoConfig.key, cryptoConfig.iv),
        refreshToken: encrypt(newToken.refresh_token, cryptoConfig.key, cryptoConfig.iv),
        expiresAt: newToken.expires_at,
        athleteId: user.strava.athleteId,
      },
    });
    return newToken.access_token;
    } catch (err) {
      console.error("request failed", err);
      return null;
    }
  }

  const verifyAccessToken = async (user:UserDto, userMapper:UserMapper, cryptoConfig: CryptoConfig, stravaConfig: StravaConfig):Promise<String|null> => {
    try {
      console.log("verifying token.........");
      
      if (!user) return null;
      if(!user.strava.accessToken) return null;
      const isExpired = Date.now() / 1000 > user.strava.expiresAt;
      let accessToken;

      if (isExpired) {
        accessToken = await refreshStravaToken(user, decrypt(user.strava.refreshToken, cryptoConfig.key, cryptoConfig.iv),userMapper, cryptoConfig, stravaConfig);
      } else {
        const encryptedAccessToken = user.strava.accessToken;
        if (!encryptedAccessToken) {
          return null;
        }
        accessToken = decrypt(encryptedAccessToken, cryptoConfig.key, cryptoConfig.iv);
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
    const { stravaActivityMapper, userMapper, cryptoConfig, stravaConfig } = dependencies;

    return{
        getStravaActivities: async (page: number, pageSize: number, filter: string) => {
            const {activities, total} = await stravaActivityMapper.findActivitiesWithPagination(page, pageSize, filter);
            return {activities, total};
        },
        


        handleStravaAuthCallback: async (code:string,userId:string):Promise<void> => {
    
            const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
            client_id: stravaConfig.clientId,
            client_secret: stravaConfig.clientSecret,
            code,
            grant_type: 'authorization_code',
            });
            
            // console.log(tokenResponse.data);
            const { access_token, refresh_token, expires_at, athlete } = tokenResponse.data;
            
            await userMapper.updateUser({
              id: userId,
              isAuthStrava: true,
              strava: {
                  accessToken: encrypt(access_token, cryptoConfig.key, cryptoConfig.iv),
                  refreshToken: encrypt(refresh_token, cryptoConfig.key, cryptoConfig.iv),
                  expiresAt: expires_at,
                  athleteId: athlete.id,
              },
            });
            await fetchStravaActivities(access_token,userId,stravaActivityMapper);
            
        },

        handleStravaWebHook: async (event:any) => {
            console.log("handle strava web hook............");
            const { athlete_id: athleteId, aspect_type: aspect, object_id: activityId } = event;
            const user = await userMapper.findByStravaAthleteId(athleteId);
            if (!user) {
                console.warn(`No user found for Strava athleteId: ${athleteId}`);
                return;
            }
            const accessToken = await verifyAccessToken(user,userMapper,cryptoConfig,stravaConfig);
            if(!accessToken) return;
            const activityResponse = await axios.get(`https://www.strava.com/api/v3/activities/${activityId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            });
        
            const record = activityResponse.data;
            const filteredRecord = {
            userId: new Types.ObjectId(user.id),
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
            };
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


