import { Request, Response } from 'express';
import axios from 'axios';
import User from '../models/userModel';
import { encrypt } from '../utils/crypto';
import Record, { RecordModel } from '../models/recordModel';
import { fetchStravaActivities, verifyAccessToken } from '../services/stravaService';


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
    
    // console.log(tokenResponse.data);
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
    fetchStravaActivities(access_token,userId);
    res.redirect(`${returnTo}`);
  } catch (error) {
    // console.error('Strava OAuth callback error:', error);
    res.redirect(`${returnTo}?strava=fail`);
  }
};

export const subscriptionValidation = async (req: Request, res: Response):Promise<void> => {
  console.log("subsription validation............");
  console.log(req.query);
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.STRAVA_VERIFY_TOKEN) {
    res.status(200).json({ 'hub.challenge': challenge });
  } else {
    res.status(403).send('Verification failed');
  }
  return;

}

export const stravaWebHook = async (req: Request, res: Response):Promise<void> => {
  console.log("message from strava web hook..........");
  const event = req.body;
  console.log(event);
  if (event.object_type !== 'activity') {
    res.status(200).send('Ignored non-activity event');
    return ;
  }

  try {
    console.log('✅ Received Strava Event:', event);
    // TODO use eventId to fetch this event and save to database
    const athleteId = event.owner_id;
    const aspect = event.aspect_type;
    const activityId = event.object_id;

    const user = await User.findOne({ 'strava.athleteId': athleteId });
    if (!user) {
      console.warn(`No user found for Strava athleteId: ${athleteId}`);
      res.status(200).send('User not found, ignored.');
      return ;
    }

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
    };
    if(aspect === 'create'){
      await Record.create(
        filteredRecord
      );
    }else if(aspect === 'update'){
      await Record.findOneAndUpdate(
        { activityId: record.id },
        filteredRecord,
        { upsert: true, new: true }
      );
    }else if(aspect === 'delete'){
      Record.findOneAndDelete(
        { activityId: record.id }
      )
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Failed to handle Strava webhook event:', err);
    res.status(500).send('Failed to process event');
  }
  
}

