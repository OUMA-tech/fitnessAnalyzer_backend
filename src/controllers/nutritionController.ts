import { Request, Response } from 'express';
import Record from '../models/recordModel';


interface RecordDocument {
  type: string;
  userId: string;
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

// 获取周度营养建议
export const getWeeklyNutrition = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = req.query;
    const userId = (req as any).user._id;

    const records = await Record.find({
      userId,
      date: {
        $gte: new Date(start as string),
        $lte: new Date(end as string)
      }
    }).lean();

    if (!records.length) {
        res.status(404).json({
        success: false,
        message: 'can not find records'
      });
    }

    // 计算每个记录的强度
    const recordsWithIntensity = records.map(record => ({
      ...record,
      calculatedIntensity: calculateIntensity(record)
    }));

    // 计算平均强度和收集运动类型
    const totalIntensity = recordsWithIntensity.reduce((sum, record) => sum + record.calculatedIntensity, 0);
    const averageIntensity = totalIntensity / records.length;
    const activityTypes = [...new Set(records.map(record => record.type))];

    // 生成营养建议
    const recommendation = calculateNutritionRecommendation(averageIntensity, activityTypes);

    // 生成运动总结
    const summary = {
      totalActivities: records.length,
      totalDuration: records.length * 60, // 假设每次运动默认60分钟
      averageIntensity
    };

    res.json({
      success: true,
      data: {
        recommendation,
        summary
      }
    });
  } catch (error) {
    console.error('get weekly nutrition failed:', error);
    res.status(500).json({
      success: false,
      message: 'get weekly nutrition failed'
    });
  }
};

// 获取单个活动的营养建议
export const getActivityNutrition = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityId } = req.params;
    const userId = (req as any).user._id;

    const record = await Record.findOne({ _id: activityId, userId }).lean();

    if (!record) {
        res.status(404).json({
        success: false,
        message: 'can not find record'
      });
      return;
    }

    // 计算运动强度
    const calculatedIntensity = calculateIntensity(record);

    // 生成针对单次运动的营养建议
    const recommendation = calculateNutritionRecommendation(calculatedIntensity, [record.type]);

    // 单次运动总结
    const summary = {
      totalActivities: 1,
      totalDuration: 60, // 假设默认60分钟
      averageIntensity: calculatedIntensity
    };

    res.json({
      success: true,
      data: {
        recommendation,
        summary
      }
    });
  } catch (error) {
    console.error('get activity nutrition failed:', error);
    res.status(500).json({
      success: false,
      message: 'get activity nutrition failed'
    });
  }
}; 