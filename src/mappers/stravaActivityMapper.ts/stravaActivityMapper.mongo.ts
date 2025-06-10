import { Model } from "mongoose";
import { StravaActivityModel } from "../../interfaces/entity/stravaActivity";

export const createMongoStravaActivityMapper = (StravaActivityModel: Model<StravaActivityModel>) => {
    return {
        findActivitiesWithPagination: async (page: number, pageSize: number, filter: any) =>{
            const activities = await StravaActivityModel.find(filter)
            .sort({ startDate: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);
            const total = await StravaActivityModel.countDocuments(filter);
            return {activities, total};
        },
        findById: (id: string) => StravaActivityModel.findById(id),
        findByUserId: (userId: string) => StravaActivityModel.find({ userId }),
        create: (stravaActivity: StravaActivityModel) => StravaActivityModel.create(stravaActivity),
        updateById: (activityId: string, stravaActivity: StravaActivityModel) => StravaActivityModel.findOneAndUpdate({ activityId }, stravaActivity, { new: true }),
        deleteByActivityId: async (activityId: string) => {
            const result = await StravaActivityModel.findOneAndDelete({ activityId });
            return result !== null;
        },
        insertActivities: (activities: StravaActivityModel[]) => StravaActivityModel.insertMany(activities, {ordered: false}),
    }
}