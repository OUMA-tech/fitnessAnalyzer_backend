import { Model } from "mongoose";
import { StravaActivityModel } from "../../models/stravaActivityModel";

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
        create: (stravaActivity: Partial<StravaActivityModel>) => StravaActivityModel.create(stravaActivity),
        updateById: (activityId: string, stravaActivity: Partial<StravaActivityModel>) => StravaActivityModel.findOneAndUpdate({ activityId }, stravaActivity, { new: true }),
        deleteByActivityId: async (activityId: string) => {
            const result = await StravaActivityModel.findOneAndDelete({ activityId });
            return result !== null;
        },
        insertActivities: async (activities: StravaActivityModel[]): Promise<void> => {
            try {
              await StravaActivityModel.insertMany(activities, { ordered: false });
            } catch (e) {
              console.error('Error inserting activities:', e);
            }
        },
        getWeeklyActivities: async (userId: string, startDate: Date, endDate: Date) => 
          await StravaActivityModel.find({ userId, startDate: { $gte: startDate, $lte: endDate } }).lean(),
        getActivityById: async (activityId: string) => StravaActivityModel.findById(activityId).lean(),
    }
}