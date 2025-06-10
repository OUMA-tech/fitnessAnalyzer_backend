import { Model } from "mongoose";
import { SubTaskModel } from "../../interfaces/entity/subTask";

export const createMongoSubTaskMapper = (SubTaskModel: Model<SubTaskModel>) => {
    return {
        findById: (id: string) => SubTaskModel.findById(id),
        findByTrainPlanId: (trainPlanId: string) => SubTaskModel.find({ trainPlanId }),
        create: (subTask: SubTaskModel) => SubTaskModel.create(subTask),
        update: (id: string, subTask: SubTaskModel) => SubTaskModel.findByIdAndUpdate(id, subTask, { new: true }),
        delete: (id: string) => SubTaskModel.findByIdAndDelete(id),
    }
}