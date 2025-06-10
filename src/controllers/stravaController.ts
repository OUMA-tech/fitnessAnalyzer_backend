// src/controllers/book.controller.ts
import { Request, Response } from 'express';
import { StravaService } from '../services/stravaActivity/stravaService.Interface';
import { verifyAccessToken } from '../services/stravaService';
import { UserMapper } from '../mappers/user/userMapper';
import axios from 'axios';



// // GET /api/books?search=关键词&category=分类&page=1&pageSize=10
// export const getRecords = async (req: Request, res: Response):Promise<void> => {
//   try {
//     const _id = (req as any).user?._id;
//     if (!_id) {
//       res.status(401).json({ message: 'unauthorized, please login' });
//       return ;
//     }

//     const page = Number(req.query.page) || 1;
//     const pageSize = Number(req.query.pageSize) || 10;
//     const category = req.query.category?.toString() || '';

//     const filter: any = {
//       userId: _id
//     };

//     if (category) {
//       filter.category = category;
//     }
//     console.log(filter);
//     const total = await Record.countDocuments(filter);
//     const records = await Record.find(filter)
//       .sort({ startDate: -1 })
//       .skip((page - 1) * pageSize)
//       .limit(pageSize);
//     console.log('records', records);
//     res.status(200).json({
//       records,
//       page,
//       totalPages: Math.ceil(total / pageSize),
//       total,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'failed getting record', error });
//   }
// };

export const createStravaController = (stravaService: StravaService, userMapper: UserMapper) => {
  return {
    getStravaActivities: async (req: Request, res: Response):Promise<void> => {
      try {
        const _id = (req as any).user?._id;
        if (!_id) {
          res.status(401).json({ message: 'unauthorized, please login' });
          return ;
        }
    
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const category = req.query.category?.toString() || '';
    
        const filter: any = {
          userId: _id
        };
    
        if (category) {
          filter.category = category;
        }
        console.log(filter);
     
        const {activities, total} = await stravaService.getStravaActivities(page, pageSize, filter);
        console.log('stravaActivities', activities);
        res.status(200).json({
          activities,
          page,
          totalPages: Math.ceil(total / pageSize),
          total,
        });
      } catch (error) {
        res.status(500).json({ message: 'failed getting record', error });
      }
    },
    stravaCallback: async (req: Request, res: Response):Promise<void> => {
      const code = req.query.code;
      const returnTo = 'https://fitness-analyzer-fronend.vercel.app/#/dashboard';
    
      if (!code) {
        res.status(400).send('Missing authorization code');
        return;
      }
    
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).send('Unauthorized');
        return;
      }
    
      try {
        await stravaService.handleStravaAuthCallback(code as string, userId);
        res.redirect(returnTo);
      } catch (err) {
        res.redirect(`${returnTo}?strava=fail`);
      }
    },
    subscriptionValidation: async (req: Request, res: Response):Promise<void> => {
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
    
    },
    stravaWebHook: async (req: Request, res: Response):Promise<void> => {
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
        const { owner_id: athleteId, aspect_type: aspect, object_id: activityId } = event;
    
        const user = await userMapper.findByStravaAthleteId(athleteId);
        if (!user) {
          console.warn(`No user found for Strava athleteId: ${athleteId}`);
          res.status(200).send('User not found, ignored.');
          return ;
        }

        await stravaService.handleStravaWebHook(user,activityId);
    
        res.status(200).send('OK');
      } catch (err) {
        console.error('❌ Failed to handle Strava webhook event:', err);
        res.status(500).send('Failed to process event');
      }
      
    }
  }
};
