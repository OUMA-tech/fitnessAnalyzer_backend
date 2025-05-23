import { Request, Response } from 'express';
import axios from 'axios';
import User from '../models/userModel';
import { encrypt } from '../utils/crypto';
import Record, { RecordModel } from '../models/recordModel';

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


export const stravaCallback = async (req: Request, res: Response):Promise<void> => {
  const code = req.query.code;
  const returnTo = 'https://fitness-analyzer-fronend.vercel.app/#/dashboard';

  if (!code) {
    res.status(400).send('Missing authorization code');
    return ;
  }

  try {
    const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });
    
    console.log(tokenResponse.data);
    const { access_token, refresh_token, expires_at, athlete } = tokenResponse.data;
    const userId = req.user?.id; 
    if (!userId) {
      res.status(401).send('Unauthorized');
      return ;
    }
    await User.findByIdAndUpdate(userId, {
      isAuthStrava: true,
      strava: {
        accessToken: encrypt(access_token),
        refreshToken: encrypt(refresh_token),
        expiresAt: expires_at,
        athleteId: athlete.id,
      },
    });

    res.redirect(`${returnTo}`);
  } catch (error) {
    // console.error('Strava OAuth callback error:', error);
    res.redirect(`${returnTo}?strava=fail`);
  }
};

export const insertActivities = async (records: RecordModel[]) => {
  console.log(records[0]);
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

export const fetchStravaActivities = async (req: Request, res: Response):Promise<void> => {
  console.log("fetching strava activities...........")
  const accessToken = (req as any).accessToken;
  const userId = (req as any).user._id.toString();
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


    res.status(200).json({
      success: true,
      message: 'Fetched Strava activities successfully.',
      records: filteredRecords,
    });
  } catch (error: any) {
    console.error('Error fetching activities:', error.response?.data || error.message);
    throw error;
  }
}