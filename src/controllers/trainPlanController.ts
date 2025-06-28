import { Request, Response } from 'express';
import { TrainPlanService } from '../services/trainPlan/trainPlanService.interface';


export const createTrainPlanController = (trainPlanService: TrainPlanService) => {
  return {
    insertTrainPlan: async (req:Request, res:Response) => {
      try{
        const userId = req.user?.id;
        const tasks = req.body.tasks;

        const success = await trainPlanService.createTrainPlansWithSubtasks(userId, tasks);
        if(success){
          res.status(200).json({
            success:true,
            message:'Insert train plans success',
          })
        }else{
          res.status(400).json({
            success:false,
            message:'Insert train plans failed',
          })
        }
      }catch(err){
        console.log(`insert failed: ${err}`);
        res.status(400).json({
          success:false,
          message:'Insert train plans failed',
        })
      }
    },
    fetchDurationPlan: async (req:Request, res:Response) => {
      const userId = req.user?.id;
      const  { start, end } = req.query;
      try{
        const plansWithSubtasks = await trainPlanService.fetchDurationPlanByDateRange(userId, start as string, end as string);
        res.status(200).json({
          success:true,
          message:'Fetch duration plan success',
          data: plansWithSubtasks,
        })
      } catch (err){
        console.log("fetch plan error:", err);
      }
    },
    updatePlan: async (req:Request, res:Response) => {
      try{
        const userId = req.user?.id;
        const plan = req.body.plan;
        await trainPlanService.updatePlan(plan);
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