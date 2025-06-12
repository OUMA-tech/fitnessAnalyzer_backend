import { TrainPlanDto } from "../../interfaces/entity/trainPlan";
import { TrainPlanMapper } from "../../mappers/trainPlan/trainPlanMapper";
import { TrainPlanModel } from '../../models/trainPlanModel';
import { SubTaskMapper } from "../../mappers/subTask/subTaskMapper";
import { SubTaskModel } from "../../models/subTaskModel";

export interface TrainPlanService {
    createTrainPlansWithSubtasks(userId:string, plans:TrainPlanDto[]):Promise<{insertedTrainPlans:TrainPlanModel[], insertedSubTasks:SubTaskModel[]}>;
    fetchDurationPlanByDateRange(userId:string, start:string, end:string):Promise<TrainPlanDto[]>;
    updatePlan(userId:string, plan:TrainPlanDto):Promise<void>;
}

export interface TrainPlanServiceDependencies {
    trainPlanMapper: TrainPlanMapper;
    subTaskMapper: SubTaskMapper;
}
