// src/controllers/book.controller.ts
import { Request, Response } from 'express';
import { StravaService } from '../services/strava/stravaService.Interface';
import { UserMapper } from '../mappers/user/userMapper';


export const createStravaController = (stravaService: StravaService, userMapper: UserMapper) => {
  return {
    getStravaActivities: async (req: Request, res: Response):Promise<void> => {
      try {
        const id = (req as any).user?.id;
        if (!id) {
          res.status(401).json({ message: 'unauthorized, please login' });
          return ;
        }
    
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const category = req.query.category?.toString() || '';
    
        const filter: any = {
          userId: id
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
    stravaWebHook: async (req: Request, res: Response):Promise<void> => {
      console.log("message from strava web hook..........");
      if(!req.body) {
        res.status(200).send('Ignored non-activity event');
        return ;
      }
      const event = req.body;
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

        await stravaService.handleStravaWebHook(event);
    
        res.status(200).send('OK');
      } catch (err) {
        console.error('❌ Failed to handle Strava webhook event:', err);
        res.status(200).send('Failed to process event, ignored.');
      }
      
    }
  }
};
