import { SubTaskDto } from "./subTask";
  
export interface TrainPlanDto {
    id: string;
    title: string;
    status: string;
    date: Date;
    subTasks: SubTaskDto[];
}

export interface TrainPlanInput {
  title: string;
  status: string;
  date: Date;
}