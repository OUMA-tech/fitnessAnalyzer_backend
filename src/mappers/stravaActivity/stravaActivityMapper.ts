import { StravaActivityModel } from "../../models/stravaActivityModel";

export interface StravaActivityMapper {
    findActivitiesWithPagination: (page: number, pageSize: number, filter: any) => Promise<{activities: StravaActivityModel[]; total: number}>;
    findById: (id: string) => Promise<StravaActivityModel | null>;
    findByUserId: (userId: string) => Promise<StravaActivityModel[]>;
    create: (stravaActivity: Partial<StravaActivityModel>) => Promise<StravaActivityModel>;
    updateById: (id: string, stravaActivity: Partial<StravaActivityModel>) => Promise<StravaActivityModel | null>;
    deleteByActivityId: (activityId: string) => Promise<boolean>;
    insertActivities: (activities: StravaActivityModel[]) => Promise<void>;
    getWeeklyActivities: (userId: string, startDate: Date, endDate: Date) => Promise<StravaActivityModel[]>;
    getActivityById: (activityId: string) => Promise<StravaActivityModel | null>;
}
