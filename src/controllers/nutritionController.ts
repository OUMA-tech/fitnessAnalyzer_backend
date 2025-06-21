import { Request, Response } from 'express';
import { NutritionService } from '../services/nutrition/nutritionService.interface';


export const createNutritionController = (nutritionService: NutritionService) => {
  return {
    getWeeklyNutrition: async (req: Request, res: Response): Promise<void> => {
      try {
        const { start, end } = req.query;
        const userId = (req as any).user._id;
    
        const { nutritionRecommendation, summary } = await nutritionService.getWeeklyNutrition(userId, start as string, end as string);
    
    
    
        res.json({
          success: true,
          data: {
            nutritionRecommendation,
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
    },
    getActivityNutrition: async (req: Request, res: Response): Promise<void> => {
      try {
        const { activityId } = req.params;
        const userId = (req as any).user._id;
    
        const { nutritionRecommendation, summary } = await nutritionService.getActivityNutrition(activityId);
        res.json({
          success: true,
          data: {
            nutritionRecommendation,
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
    }
  }
}

