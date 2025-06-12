import { StravaActivityModel } from "../../models/stravaActivityModel";

export interface StravaActivityMapper {
    findActivitiesWithPagination: (page: number, pageSize: number, filter: any) => Promise<{activities: StravaActivityModel[]; total: number}>;
    findById: (id: string) => Promise<StravaActivityModel | null>;
    findByUserId: (userId: string) => Promise<StravaActivityModel[]>;
    create: (stravaActivity: StravaActivityModel) => Promise<StravaActivityModel>;
    updateById: (id: string, stravaActivity: StravaActivityModel) => Promise<StravaActivityModel | null>;
    deleteByActivityId: (activityId: string) => Promise<boolean>;
    insertActivities: (activities: StravaActivityModel[]) => Promise<void>;
}
