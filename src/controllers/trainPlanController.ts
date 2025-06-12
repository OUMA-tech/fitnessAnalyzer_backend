import { Request, Response } from 'express';
import { TrainPlanService } from '../services/trainPlan/trainPlanService.interface';


export const createTrainPlanController = (trainPlanService: TrainPlanService) => {
  return {
    insertTrainPlan: async (req:Request, res:Response) => {
      try{
        const userId = req.user?.id;
        const tasks = req.body.tasks;

        const {insertedTrainPlans, insertedSubTasks} = await trainPlanService.createTrainPlansWithSubtasks(userId, tasks);
        console.log(`✅ insert  ${insertedTrainPlans.length} new trainPlans`);
        console.log(`✅ insert  ${insertedSubTasks.length} new subTasks`);
        res.status(200).json({
          success:true,
          message:'Insert train plans success',
        })
      }catch(err){
        console.log(`insert failed: ${err}`);
      }
    },
    fetchDurationPlan: async (req:Request, res:Response) => {
      const userId = req.user?.id;
      const  { start, end } = req.query;
      const plansWithSubtasks = await trainPlanService.fetchDurationPlanByDateRange(userId, start as string, end as string);
      res.status(200).json({
        success:true,
        message:'Fetch duration plan success',
        data: plansWithSubtasks,
      })
    },
    updatePlan: async (req:Request, res:Response) => {
      try{
        const userId = req.user?.id;
        const plan = req.body.plan;
        await trainPlanService.updatePlan(userId, plan);
        res.status(200).json({
          success:true,
          message:'update plan success',
        })
      }
      catch(err){
        console.log("update plans failed:",err);
      }
    }
  }
}