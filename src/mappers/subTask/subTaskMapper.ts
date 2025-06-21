import { SubTaskModel } from "../../models/subTaskModel";
import { SubtaskInput } from "../../interfaces/entity/subTask";

export interface SubTaskMapper {
    insertMany: (subTasks: SubtaskInput[]) => Promise<SubTaskModel[]>;
    updateCompleted: (subtasks: SubtaskInput[], session: any) => Promise<void>;
}