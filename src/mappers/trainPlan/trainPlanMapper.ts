import { Model } from "mongoose";
import { TrainPlanModel } from "../../interfaces/entity/trainPlan";

export interface TrainPlanMapper {
    findById: (id: string) => Promise<TrainPlanModel | null>;
    findByUserId: (userId: string) => Promise<TrainPlanModel[]>;
    create: (trainPlan: TrainPlanModel) => Promise<TrainPlanModel>;
    update: (id: string, trainPlan: TrainPlanModel) => Promise<TrainPlanModel | null>;
    delete: (id: string) => Promise<boolean>;
}