import { Request, Response } from 'express';
import TrainPlan from '../models/trainPlanModel';
import SubTask from '../models/subTaskModel';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

interface SubTask {
  id: number;
  content: string;
  completed: boolean;
  trainPlanId: string;
}

export interface Plan {
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
    const trainPlans = tasks.map((plan:Plan)=>({
      title:plan.title,
      date:plan.date,
      userId:userId,
      status: plan.status,
    }));

    
    // console.log(trainPlans[0]);
    const insertedTrainPlans = await TrainPlan.insertMany(trainPlans);
    console.log(`✅ insert  ${insertedTrainPlans.length} new trainPlans`);
    // console.log(insertedTrainPlans[0]);
    const subTasks = insertedTrainPlans.flatMap((plan, index)=>
      tasks[index].subTasks.map((subTask:SubTask)=>({
        trainPlanId:plan._id,
        content:subTask.content,
        completed:subTask.completed,
      }))
    )
    const insertedSubtasks = await SubTask.insertMany(subTasks);
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

export const fetchDurationPlan = async (req:Request, res:Response) => {
  console.log("fetch duration plans")
  const userId = req.user?.id;
  const  { start, end } = req.query;
  const objuserId = new mongoose.Types.ObjectId(userId);
  if(typeof start === 'string' && typeof end === 'string'){
  
  try{
    // const result = await TrainPlan.find({userId: userId, date: date});
    // // console.log(result);
    // console.log(`✅ find  ${result.length} today's plans`);
    const plansWithSubtasks = await TrainPlan.aggregate([
      { $match: { 
        userId: objuserId, 
        date: { $gte: new Date(start), $lte: new Date(end) }
        }
      },  
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
    const result = plansWithSubtasks.map(plan => {
      const transformedPlan = {
        ...plan,
        id: plan._id,
        subTasks: plan.subTasks.map((sub:any) => {
          const s = { ...sub, id: sub._id };
          delete s._id;
          return s;
        }),
      };
      delete transformedPlan._id;
      return transformedPlan;
    });
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

export const updatePlan = async(req:Request, res:Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const data = req.body.plan;
  const subtasks = data.subTasks;
  if(subtasks.length!==0){
    const trainPlanId = subtasks[0].trainPlanId;
    console.log(subtasks);
    try{
      const operations = subtasks.map((sub:SubTask) => ({
        updateOne: {
          filter: { _id: sub.id },
          update: { $set: { completed: sub.completed } },
        }
      }));
      await SubTask.bulkWrite(operations);
      const completed = subtasks.every((sub:SubTask)=> sub.completed);
      const newStatus = completed ? 'completed' : 'draft';

      await TrainPlan.updateOne(
        { _id: trainPlanId },
        { $set: { status: newStatus } }
      );
      await session.commitTransaction();
      res.status(200).json({
        success:true,
        message:'update plan success',
      })
    }catch(err){
      console.log("update plans failed:",err);
      await session.abortTransaction();
    }
    finally {
      session.endSession();
    }
  }else {
    try {
      const plan = req.body.plan;
      console.log(typeof plan.id);
      await TrainPlan.updateOne(
        { _id: new ObjectId(plan.id) },
        { $set: { status: plan.status } }
      );
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