import { StravaActivityMapper } from "../../mappers/stravaActivity/stravaActivityMapper";

export interface NutritionService {
    getWeeklyNutrition: (userId: string, start: string, end: string) => Promise<{ nutritionRecommendation: any, summary: any }>;
    getActivityNutrition: (activityId: string) => Promise<{ nutritionRecommendation: any, summary: any }>;
}

export interface NutritionServiceDependencies {
    stravaActivityMapper: StravaActivityMapper
}

