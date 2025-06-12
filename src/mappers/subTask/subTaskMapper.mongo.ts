import { Model } from "mongoose";
import { SubTaskModel } from "../../models/subTaskModel";
import { SubtaskInput } from "../../interfaces/entity/subTask";
import mongoose from "mongoose";
import { Types } from "mongoose";

export const createMongoSubTaskMapper = (SubTaskModel: Model<SubTaskModel>) => {
    return {
        insertMany: (subTasks: SubtaskInput[]) => {
            const tasksWithObjectId = subTasks.map(task => ({
                ...task,
                trainPlanId: new Types.ObjectId(task.trainPlanId)
            }));
            return SubTaskModel.insertMany(tasksWithObjectId);
        },
        updateCompleted: async (subtasks: SubtaskInput[], session: any) => {
            const operations = subtasks.map((sub: any) => ({
                updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(sub.id as string) },
                update: { $set: { completed: sub.completed } },
                },
            }));
            await SubTaskModel.bulkWrite(operations, { session });
        }
    }
}