import { SubTaskModel } from "../../models/subTaskModel";

export interface SubTaskMapper {
    findById: (id: string) => Promise<SubTaskModel | null>;
    findByTrainPlanId: (trainPlanId: string) => Promise<SubTaskModel[]>;
    create: (subTask: SubTaskModel) => Promise<SubTaskModel>;
    update: (id: string, subTask: SubTaskModel) => Promise<SubTaskModel | null>;
    delete: (id: string) => Promise<boolean>;
}