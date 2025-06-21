import { TrainPlanDto, TrainPlanInput } from "../../interfaces/entity/trainPlan";
import { TrainPlanModel } from "../../models/trainPlanModel";

export interface TrainPlanMapper {
    findByDateRange: (userId: string, start: string, end: string) => Promise<TrainPlanDto[]>;
    insertMany: (trainPlans: TrainPlanInput[]) => Promise<TrainPlanModel[]>;
    updateCompleted: (trainPlanId: string, updateData: any, session?: any) => Promise<void>;
}