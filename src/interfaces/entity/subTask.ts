
export interface SubTaskDto {
    id: string;
    trainPlanId: string;
    content: string;
    completed: boolean;
}

export interface SubtaskInput {
  trainPlanId: string;
  content: string;
  completed: boolean;
}
