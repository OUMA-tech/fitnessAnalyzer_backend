import { SubtaskInput } from "../../interfaces/entity/subTask";
import { TrainPlanDto, TrainPlanInput } from "../../interfaces/entity/trainPlan";
import { TrainPlanService, TrainPlanServiceDependencies } from "./trainPlanService.interface";
import mongoose from 'mongoose';

export const createTrainPlanService = (dependencies: TrainPlanServiceDependencies): TrainPlanService => {
    const { trainPlanMapper, subTaskMapper } = dependencies;
    return {
        createTrainPlansWithSubtasks: async (userId: string, plans: TrainPlanDto[]) => {
            const session = await mongoose.startSession();
            session.startTransaction();
            try{
                const trainPlans = plans.map(plan => ({
                    title: plan.title,
                    date: plan.date,
                    userId,
                    status: plan.status,
                  })) as TrainPlanInput[];
                const insertedTrainPlans = await trainPlanMapper.insertMany(trainPlans);
                const subTasks = insertedTrainPlans.flatMap((plan, index) =>
                    plans[index].subTasks.map(subTask => ({
                      trainPlanId: plan._id.toString(),
                      content: subTask.content,
                      completed: subTask.completed,
                    }))
                  ) as SubtaskInput[];
                const insertedSubTasks = await subTaskMapper.insertMany(subTasks);
                await session.commitTransaction();
                session.endSession();
                if(insertedTrainPlans.length > 0 && insertedSubTasks.length > 0){
                    return true;
                }
                return false;
            }catch(err){
                await session.abortTransaction();
                console.error(err);
                return false;
            }finally{
                await session.endSession();
            }
            
        },
        fetchDurationPlanByDateRange: async (userId: string, start: string, end: string) => {
            const plansWithSubtasks = await trainPlanMapper.findByDateRange(userId, start, end);
            return plansWithSubtasks;
        },
        updatePlan: async (plan: TrainPlanDto) => {
            const subtasks = plan.subTasks;
            const trainPlanId = plan.id as string;
            if (subtasks && subtasks.length > 0) {
                const session = await mongoose.startSession();
                session.startTransaction();
                try {
                    
                    await subTaskMapper.updateCompleted( subtasks, session);

                    const allCompleted = subtasks.every((sub: any) => sub.completed);
                    const newStatus = allCompleted ? "completed" : "draft";

                    await trainPlanMapper.updateCompleted(trainPlanId, { status: newStatus }, { session });

                    await session.commitTransaction();
                } catch (err) {
                await session.abortTransaction();
                throw err;
                } finally {
                session.endSession();
                }
            } else {
                await trainPlanMapper.updateCompleted(trainPlanId, {status: plan.status})
            }
        }
    }
}