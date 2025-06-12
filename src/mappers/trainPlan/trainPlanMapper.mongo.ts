import mongoose, { Model, Types } from "mongoose";
import { TrainPlanModel } from "../../models/trainPlanModel";
import { TrainPlanInput } from "../../interfaces/entity/trainPlan";
import { toClient, toClientList, toClientWithSubtasks } from "../../utils/toClient";

export const createMongoTrainPlanMapper = (TrainPlanModel: Model<TrainPlanModel>) => {
    return {
        insertMany: async (trainPlans: TrainPlanInput[]) => {
            return TrainPlanModel.insertMany(trainPlans);
        },
        findByDateRange: async (userId: string, start: string, end: string) => {
            const objUserId = new Types.ObjectId(userId);
            const startDate = new Date(start);
            const endDate = new Date(end);
            const trainPlans = await TrainPlanModel.aggregate([
                { 
                    $match: { 
                        userId: objUserId, 
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $lookup: {
                        from: "subtasks",
                        localField: "_id",
                        foreignField: "trainPlanId",
                        as: "subTasks"
                    }
                }
            ]);
            return trainPlans.map(plan => toClientWithSubtasks(plan));
        },
        updateCompleted: async (trainPlanId: string, updateData: any, session: any) => {
            await TrainPlanModel.updateOne(
                { _id: new mongoose.Types.ObjectId(trainPlanId as string) },
                { $set: updateData },
                { session }
            );
        }
    }
}