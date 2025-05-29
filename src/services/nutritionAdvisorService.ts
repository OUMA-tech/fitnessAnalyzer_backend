import { Types } from 'mongoose';

interface ActivityMetrics {
  averageHeartRate: number;
  maxHeartRate: number;
  duration: number; // in minutes
  type: string;
  intensity: number; // 0-1 scale
  elevationGain?: number;
  distance?: number;
}

interface NutritionRecommendation {
  carbs: {
    percentage: number;
    explanation: string;
  };
  protein: {
    percentage: number;
    explanation: string;
  };
  fats: {
    percentage: number;
    explanation: string;
  };
  timing: string;
  hydration: string;
}

class NutritionAdvisorService {
  private calculateIntensityForWeightTraining(metrics: ActivityMetrics): number {
    // 力量训练强度计算
    // 1. 主要考虑最大心率占比，因为这反映了运动的峰值强度
    // 2. 持续时间作为次要因素，因为力量训练通常时间较短但强度高
    const maxHrIntensity = metrics.maxHeartRate / 220; // 使用220-年龄公式的简化版
    const durationFactor = Math.min(metrics.duration / 90, 1); // 1.5小时作为基准
    
    return (maxHrIntensity * 0.8 + durationFactor * 0.2);
  }

  private calculateIntensityForCardio(metrics: ActivityMetrics): number {
    // 有氧运动强度计算
    // 1. 平均心率是主要指标，因为有氧运动追求稳定的心率区间
    // 2. 持续时间作为重要的次要因素
    const avgHrIntensity = metrics.averageHeartRate / metrics.maxHeartRate;
    const durationFactor = Math.min(metrics.duration / 120, 1); // 2小时作为基准
    
    return (avgHrIntensity * 0.7 + durationFactor * 0.3);
  }

  private calculateIntensityForHIIT(metrics: ActivityMetrics): number {
    // HIIT训练强度计算
    // 1. 同时考虑最大心率和平均心率，因为HIIT包含高强度和恢复期
    // 2. 时间作为较小的权重因素，因为HIIT通常时间较短
    const maxHrIntensity = metrics.maxHeartRate / 220;
    const avgHrIntensity = metrics.averageHeartRate / metrics.maxHeartRate;
    const durationFactor = Math.min(metrics.duration / 45, 1); // 45分钟作为基准
    
    return (maxHrIntensity * 0.5 + avgHrIntensity * 0.3 + durationFactor * 0.2);
  }

  private calculateIntensity(metrics: ActivityMetrics): number {
    // 根据运动类型选择不同的强度计算方法
    switch (metrics.type.toLowerCase()) {
      case 'weighttraining':
      case 'workout':
      case 'crossfit':
        return this.calculateIntensityForWeightTraining(metrics);
      
      case 'run':
      case 'ride':
      case 'swim':
      case 'yoga':
        return this.calculateIntensityForCardio(metrics);
      
      case 'hiit':
      case 'circuit':
      case 'interval':
        return this.calculateIntensityForHIIT(metrics);
      
      default:
        // 默认使用有氧运动的计算方法
        return this.calculateIntensityForCardio(metrics);
    }
  }

  private getBaseRecommendation(intensity: number, type: string): NutritionRecommendation {
    // 基础营养比例
    let carbs = 0;
    let protein = 0;
    let fats = 0;
    let explanation = '';

    // 根据运动类型调整基础比例
    const isStrengthTraining = ['weighttraining', 'workout', 'crossfit'].includes(type.toLowerCase());
    const isHIIT = ['hiit', 'circuit', 'interval'].includes(type.toLowerCase());

    if (intensity < 0.4) {
      // 低强度活动
      if (isStrengthTraining) {
        carbs = 45;
        protein = 30;
        fats = 25;
        explanation = '低强度力量训练，保持适量蛋白质摄入';
      } else {
        carbs = 50;
        protein = 25;
        fats = 25;
        explanation = '低强度活动主要消耗脂肪，建议适量碳水和蛋白质';
      }
    } else if (intensity < 0.7) {
      // 中等强度
      if (isStrengthTraining) {
        carbs = 50;
        protein = 30;
        fats = 20;
        explanation = '中等强度力量训练，需要充足的蛋白质和碳水';
      } else if (isHIIT) {
        carbs = 55;
        protein = 25;
        fats = 20;
        explanation = '高强度间歇训练需要良好的碳水补充';
      } else {
        carbs = 60;
        protein = 20;
        fats = 20;
        explanation = '中等强度有氧活动需要更多碳水供能';
      }
    } else {
      // 高强度
      if (isStrengthTraining) {
        carbs = 45;
        protein = 40;
        fats = 15;
        explanation = '高强度力量训练需要大量蛋白质支持肌肉恢复';
      } else if (isHIIT) {
        carbs = 50;
        protein = 35;
        fats = 15;
        explanation = '剧烈间歇运动需要优质蛋白质和充足碳水';
      } else {
        carbs = 65;
        protein = 20;
        fats = 15;
        explanation = '高强度持续性运动需要大量碳水供能';
      }
    }

    return {
      carbs: {
        percentage: carbs,
        explanation: `碳水化合物: ${explanation}`
      },
      protein: {
        percentage: protein,
        explanation: `蛋白质: 用于肌肉恢复和生长`
      },
      fats: {
        percentage: fats,
        explanation: '健康脂肪: 维持激素平衡和营养吸收'
      },
      timing: this.getTimingRecommendation(intensity, type),
      hydration: this.getHydrationRecommendation(intensity, type)
    };
  }

  private getTimingRecommendation(intensity: number, type: string): string {
    const isStrengthTraining = ['weighttraining', 'workout', 'crossfit'].includes(type.toLowerCase());
    
    if (intensity > 0.7) {
      if (isStrengthTraining) {
        return '训练后30分钟内补充快速吸收的蛋白质（20-30g）和碳水，2小时内进行正餐';
      }
      return '运动后30分钟内补充快速吸收的碳水和适量蛋白质，2小时内进行正餐';
    } else if (intensity > 0.4) {
      if (isStrengthTraining) {
        return '训练后1小时内补充优质蛋白质，可以搭配适量碳水';
      }
      return '运动后1小时内进行正常饮食即可';
    }
    return '保持正常饮食节奏即可';
  }

  private getHydrationRecommendation(intensity: number, type: string): string {
    const isStrengthTraining = ['weighttraining', 'workout', 'crossfit'].includes(type.toLowerCase());
    
    if (intensity > 0.7) {
      if (isStrengthTraining) {
        return '训练中注意补充水分，每30分钟200-300ml，训练后及时补充电解质';
      }
      return '每小时补充500-700ml水分，考虑添加电解质';
    } else if (intensity > 0.4) {
      if (isStrengthTraining) {
        return '训练中适量饮水，注意补充水分';
      }
      return '每小时补充400-500ml水分';
    }
    return '保持正常饮水量，注意渴了就喝';
  }

  public async getRecommendation(metrics: ActivityMetrics): Promise<NutritionRecommendation> {
    const intensity = this.calculateIntensity(metrics);
    let recommendation = this.getBaseRecommendation(intensity, metrics.type);
    return recommendation;
  }

  // 未来可以添加的功能：
  // 1. 考虑用户的训练目标（减脂/增肌/耐力）
  // 2. 考虑一周的训练量和疲劳度
  // 3. 考虑用户的饮食偏好和限制
  // 4. 集成 AI 模型进行更个性化的建议
}

export default new NutritionAdvisorService(); 