import { Request, Response } from 'express';
import TrainPlan from '../models/trainPlanModel';
import SubTask from '../models/subTaskModel';
import mongoose from 'mongoose';

interface SubTask {
  id: number;
  content: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  status: string;
  date: Date;
  subTasks: SubTask[];
  expanded: boolean;
}

export const insertTrainPlan = async (req:Request, res:Response) => {
  try{
    const userId = req.user?.id;
    const tasks = req.body.tasks;
    const trainPlans = tasks.map((task:Task)=>({
      title:task.title,
      date:task.date,
      userId:userId,
      status: task.status,
    }));

    
    console.log(trainPlans[0]);
    const insertedTrainPlans = await TrainPlan.insertMany(trainPlans,{ordered:false});
    console.log(`✅ insert  ${insertedTrainPlans.length} new trainPlans`);
    console.log(insertedTrainPlans[0]);
    const subTasks = insertedTrainPlans.flatMap((plan, index)=>
      tasks[index].subTasks.map((subTask:SubTask)=>({
        trainPlanId:plan._id,
        content:subTask.content,
        completed:subTask.completed,
      }))
    )
    const insertedSubtasks = await SubTask.insertMany(subTasks,{ordered:false});
    console.log(`✅ insert  ${insertedSubtasks.length} new subTasks`);
    // console.log(insertedSubtasks[0]);
    res.status(200).json({
      success:true,
      message:'Insert train plans success',
    })
  }catch(err){
    console.log(`insert failed: ${err}`);
  }
  
};

export const fetchTodayPlan = async (req:Request, res:Response) => {
  const userId = req.user?.id;
  const rawDate = req.query.date;
  const objuserId = new mongoose.Types.ObjectId(userId);
  if(typeof rawDate === 'string'){
    const date = new Date(rawDate);
  
  try{
    // const result = await TrainPlan.find({userId: userId, date: date});
    // // console.log(result);
    // console.log(`✅ find  ${result.length} today's plans`);
    const plansWithSubtasks = await TrainPlan.aggregate([
      { $match: { userId: objuserId, date:date} },  // 过滤用户
      {
        $lookup: {
          from: "subtasks",             
          localField: "_id",            
          foreignField: "trainPlanId",  
          as: "subTasks",               
        },
      },
    ]);
    console.log(plansWithSubtasks);
    const result = plansWithSubtasks.map(plan => ({
      ...plan,
      id: plan._id,
      _id: undefined, // 或 delete plan._id
    }));
    console.log(result);
    res.status(200).json({
      success:true,
      message:'Insert train plans success',
      data: result,
    })
  }catch(err){
    console.log(`find failed: ${err}`);
  }
  }
  
};
