import Record, { RecordModel } from "../models/stravaActivityModel";
import axios from "axios";
import { encrypt, decrypt } from "../utils/crypto";
import { UserModel } from "../models/userModel";

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

const insertActivities = async (records: RecordModel[]) => {
    // console.log(records[0]);
    const existing = await Record.find({ activityId: { $in: records.map(d => d.activityId) } }).select('stravaId');
    const existingIds = new Set(existing.map(e => e.activityId));
    const newDocs = records
    .filter(d => !existingIds.has(d.activityId));
    console.log(newDocs[1]);
  
    if (newDocs.length > 0) {
      await Record.insertMany(newDocs);
      console.log(`✅ inserted ${newDocs.length} new records`);
    } else {
      console.log('📭 no new records');
    }
  };
  
export const fetchStravaActivities = async (accessToken:string,userId:string)=> {
    console.log("fetching strava activities...........")
    try {
      const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
  
      });
      // console.log(response.length);
      const records = response.data;
      // console.log(records.length);
      const filteredRecords = records.map((record:StravaApiActivity) => ({
        userId: userId,
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
      }));
      console.log(filteredRecords[0]);
      await insertActivities(filteredRecords);
  
    } catch (error: any) {
      console.error('Error fetching activities:', error.response?.data || error.message);
      throw error;
    }
  }

  export const refreshStravaToken = async (user:UserModel,refreshToken:string) => {
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
  
  export const verifyAccessToken = async (user:UserModel):Promise<String|null> => {
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
  