import { Types } from 'mongoose';
import { NutritionServiceDependencies } from './nutritionService.interface';

interface RecordDocument {
  type: string;
  userId: Types.ObjectId;
  activityId: number;
  name: string;
  source: "apple_watch" | "garmin" | "wahoo" | "manual" | "other";
  distance: number;
}

// 计算运动强度的辅助函数
const calculateIntensity = (record: RecordDocument) => {
  // 根据运动类型设置基础强度
  const baseIntensity: Record<string, number> = {
    'WeightTraining': 0.7,  // 力量训练默认强度较高
    'Crossfit': 0.7,
    'Run': 0.6,             // 跑步默认中等强度
    'Ride': 0.5,            // 骑行默认中等偏下强度
    'Swim': 0.6,            // 游泳默认中等强度
    'other': 0.5            // 其他运动默认中等强度
  };

  return baseIntensity[record.type];
};

// 计算营养建议的辅助函数
const calculateNutritionRecommendation = (averageIntensity: number, activityTypes: string[]) => {
  let carbsPercentage = 50; // 基础碳水比例
  let proteinPercentage = 25; // 基础蛋白质比例
  let fatsPercentage = 25; // 基础脂肪比例

  // 根据运动强度调整
  if (averageIntensity > 0.7) { // 高强度
    carbsPercentage = 60;
    proteinPercentage = 25;
    fatsPercentage = 15;
  } else if (averageIntensity > 0.4) { // 中等强度
    carbsPercentage = 55;
    proteinPercentage = 25;
    fatsPercentage = 20;
  }

  // 根据运动类型调整
  if (activityTypes.includes('WeightTraining')) {
    proteinPercentage += 5;
    carbsPercentage -= 5;
  }

  return {
    carbs: {
      percentage: carbsPercentage,
      explanation: `According to your intensity and type of activity, we recommend you to intake ${carbsPercentage}% of carbs, which can provide enough energy.`
    },
    protein: {
      percentage: proteinPercentage,
      explanation: `We recommend you to intake ${proteinPercentage}% of protein, which can help with muscle recovery and growth.`
    },
    fats: {
      percentage: fatsPercentage,
      explanation: `We recommend you to intake ${fatsPercentage}% of fats, which can ensure the basic body functions.`
    },
    timing: 'We recommend you to intake main meal 2-3 hours before activity, and 30 minutes after activity, with carbs and protein.',
    hydration: 'We recommend you to drink 2000-2500ml water per day, and 200-300ml water every 15-20 minutes during activity.'
  };
};


export const createNutritionService = (dependencies: NutritionServiceDependencies) => {
    const { stravaActivityMapper } = dependencies;
    return {
        getWeeklyNutrition: async (userId: string, start: string, end: string) => {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const activities = await stravaActivityMapper.getWeeklyActivities(userId, startDate, endDate);
            const activitiesWithIntensity = activities.map(activity => ({
                ...activity,
                calculatedIntensity: calculateIntensity(activity)
              }));
            const averageIntensity = activitiesWithIntensity.reduce((acc, activity) => acc + activity.calculatedIntensity, 0) / activitiesWithIntensity.length;
            const nutritionRecommendation = calculateNutritionRecommendation(averageIntensity, activities.map(activity => activity.type));

            const summary = {
                totalActivities: activities.length,
                totalDuration: activities.reduce((acc, activity) => acc + activity.elapsedTime, 0),
                averageIntensity
              };
            return { nutritionRecommendation, summary };
        },

        getActivityNutrition: async (activityId: string) => {
            const activity = await stravaActivityMapper.getActivityById(activityId);
            if (!activity) {
                throw new Error('Activity not found');
            }
            const intensity = calculateIntensity(activity);
            const nutritionRecommendation = calculateNutritionRecommendation(intensity, [activity.type]);
            const summary = {
                totalActivities: 1,
                totalDuration: activity.elapsedTime,
                averageIntensity: intensity
              };
            return { nutritionRecommendation, summary };
        }
    }
}
