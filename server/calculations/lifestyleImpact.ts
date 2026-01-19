/**
 * 生活方式影响计算引擎
 * 基于Harvard T.H. Chan公共卫生学院的研究
 * 参考文献: Li Y, et al. Impact of Healthy Lifestyle Factors on Life Expectancies in the US Population. Circulation. 2018
 */

import type { DailyCheckin } from "../../drizzle/schema";

export interface LifestyleFactors {
  exerciseMinutesPerWeek: number; // 每周运动时间（分钟）
  sleepHoursPerNight: number; // 每晚睡眠时间（小时）
  dietQuality: number; // 饮食质量评分（0-10）
  stressLevel: number; // 压力水平（0-10，0最低）
  smokingCigarettesPerDay: number; // 每天吸烟支数
  alcoholDrinksPerWeek: number; // 每周饮酒杯数
  bmi: number; // 身体质量指数
  socialConnection: number; // 社交连接评分（0-10）
}

export interface LifestyleImpactResult {
  totalAdjustment: number; // 总寿命调整（年）
  exerciseAdjustment: number;
  sleepAdjustment: number;
  dietAdjustment: number;
  stressAdjustment: number;
  smokingAdjustment: number;
  alcoholAdjustment: number;
  bmiAdjustment: number;
  socialAdjustment: number;
  lifestyleScore: number; // 生活方式评分（0-100）
}

/**
 * 计算生活方式对寿命的影响
 * @param factors 生活方式因素
 * @returns 寿命调整结果
 */
export function calculateLifestyleImpact(factors: LifestyleFactors): LifestyleImpactResult {
  const result: LifestyleImpactResult = {
    totalAdjustment: 0,
    exerciseAdjustment: 0,
    sleepAdjustment: 0,
    dietAdjustment: 0,
    stressAdjustment: 0,
    smokingAdjustment: 0,
    alcoholAdjustment: 0,
    bmiAdjustment: 0,
    socialAdjustment: 0,
    lifestyleScore: 0,
  };

  // 1. 运动影响
  // 最优：≥150分钟/周中等强度运动 -> +2.5年
  // 公式：每周运动时间 × 0.05年/小时
  const exerciseHoursPerWeek = factors.exerciseMinutesPerWeek / 60;
  result.exerciseAdjustment = Math.min(exerciseHoursPerWeek * 0.05, 2.5);

  // 2. 睡眠影响
  // 最优：7-8小时/晚 -> +1.5年
  // 偏离最优范围越远，调整越负面
  const optimalSleep = 7.5;
  const sleepDeviation = Math.abs(factors.sleepHoursPerNight - optimalSleep);
  if (sleepDeviation <= 0.5) {
    result.sleepAdjustment = 1.5;
  } else if (sleepDeviation <= 2) {
    result.sleepAdjustment = 1.5 - (sleepDeviation - 0.5) * 0.5;
  } else {
    result.sleepAdjustment = Math.max(-2, 1.5 - sleepDeviation * 0.3);
  }

  // 3. 饮食影响
  // 最优：评分10 -> +3年
  // 公式：(饮食评分 - 5) × 0.3年/分
  result.dietAdjustment = (factors.dietQuality - 5) * 0.3;

  // 4. 压力影响
  // 最优：低压力（<3/10） -> +1.5年
  // 公式：(10 - 压力水平) × 0.15年/分
  result.stressAdjustment = (10 - factors.stressLevel) * 0.15;

  // 5. 吸烟影响
  // 最优：不吸烟 -> +8年
  // 每支烟 -0.15年
  result.smokingAdjustment = -factors.smokingCigarettesPerDay * 0.15;
  if (factors.smokingCigarettesPerDay === 0) {
    result.smokingAdjustment = 8;
  }

  // 6. 饮酒影响
  // 最优：适度（<2杯/天） -> +1年
  // 过量饮酒 -0.2年/杯
  const drinksPerDay = factors.alcoholDrinksPerWeek / 7;
  if (drinksPerDay <= 1) {
    result.alcoholAdjustment = 1;
  } else if (drinksPerDay <= 2) {
    result.alcoholAdjustment = 1 - (drinksPerDay - 1) * 0.5;
  } else {
    result.alcoholAdjustment = -Math.min((drinksPerDay - 2) * 0.2, 3);
  }

  // 7. BMI影响
  // 最优：BMI 18.5-24.9 -> +2年
  // 公式：BMI偏离正常范围扣分
  if (factors.bmi >= 18.5 && factors.bmi <= 24.9) {
    result.bmiAdjustment = 2;
  } else if (factors.bmi >= 25 && factors.bmi <= 29.9) {
    result.bmiAdjustment = 2 - (factors.bmi - 25) * 0.2;
  } else if (factors.bmi >= 30) {
    result.bmiAdjustment = Math.max(-3, 1 - (factors.bmi - 30) * 0.1);
  } else if (factors.bmi < 18.5) {
    result.bmiAdjustment = 2 - (18.5 - factors.bmi) * 0.2;
  }

  // 8. 社交连接影响
  // 最优：良好社交 -> +1.5年
  // 公式：(社交评分 / 10) × 1.5年
  result.socialAdjustment = (factors.socialConnection / 10) * 1.5;

  // 计算总调整
  result.totalAdjustment =
    result.exerciseAdjustment +
    result.sleepAdjustment +
    result.dietAdjustment +
    result.stressAdjustment +
    result.smokingAdjustment +
    result.alcoholAdjustment +
    result.bmiAdjustment +
    result.socialAdjustment;

  // 计算生活方式评分（0-100）
  result.lifestyleScore = calculateLifestyleScore(factors);

  return result;
}

/**
 * 计算生活方式评分（0-100）
 * @param factors 生活方式因素
 * @returns 生活方式评分
 */
function calculateLifestyleScore(factors: LifestyleFactors): number {
  let score = 0;
  let maxScore = 0;

  // 运动评分（最多20分）
  const exerciseScore = Math.min((factors.exerciseMinutesPerWeek / 150) * 20, 20);
  score += exerciseScore;
  maxScore += 20;

  // 睡眠评分（最多15分）
  const sleepDeviation = Math.abs(factors.sleepHoursPerNight - 7.5);
  const sleepScore = Math.max(0, 15 - sleepDeviation * 3);
  score += sleepScore;
  maxScore += 15;

  // 饮食评分（最多20分）
  const dietScore = (factors.dietQuality / 10) * 20;
  score += dietScore;
  maxScore += 20;

  // 压力评分（最多15分）
  const stressScore = ((10 - factors.stressLevel) / 10) * 15;
  score += stressScore;
  maxScore += 15;

  // 吸烟评分（最多15分）
  const smokingScore = factors.smokingCigarettesPerDay === 0 ? 15 : Math.max(0, 15 - factors.smokingCigarettesPerDay);
  score += smokingScore;
  maxScore += 15;

  // 饮酒评分（最多10分）
  const drinksPerDay = factors.alcoholDrinksPerWeek / 7;
  const alcoholScore = drinksPerDay <= 1 ? 10 : Math.max(0, 10 - (drinksPerDay - 1) * 5);
  score += alcoholScore;
  maxScore += 10;

  // 标准化评分到0-100
  return Math.round((score / maxScore) * 100);
}

/**
 * 从每日打卡数据聚合生活方式因素
 * @param checkins 每日打卡记录数组
 * @param weight 体重（kg）
 * @param height 身高（cm）
 * @returns 聚合的生活方式因素
 */
export function aggregateLifestyleFactors(
  checkins: any[],
  weight?: number,
  height?: number
): LifestyleFactors {
  if (checkins.length === 0) {
    return {
      exerciseMinutesPerWeek: 0,
      sleepHoursPerNight: 7,
      dietQuality: 5,
      stressLevel: 5,
      smokingCigarettesPerDay: 0,
      alcoholDrinksPerWeek: 0,
      bmi: 22,
      socialConnection: 5,
    };
  }

  // 计算平均值
  const avgExerciseMinutes =
    checkins.reduce((sum, c) => sum + (c.exerciseMinutes || 0), 0) / checkins.length;
  const avgSleepHours = checkins.reduce((sum, c) => sum + (c.sleepHours ? Number(c.sleepHours) : 7), 0) / checkins.length;
  const avgDietQuality = checkins.reduce((sum, c) => sum + (c.dietQuality || 5), 0) / checkins.length;
  const avgStressLevel = checkins.reduce((sum, c) => sum + (c.stressLevel || 5), 0) / checkins.length;
  const avgSmokingCigarettes = checkins.reduce((sum, c) => sum + (c.smokingCigarettes || 0), 0) / checkins.length;
  const avgAlcoholDrinks = checkins.reduce((sum, c) => sum + (c.alcoholDrinks ? Number(c.alcoholDrinks) : 0), 0) / checkins.length;

  // 周运动时间
  const exerciseMinutesPerWeek = avgExerciseMinutes * 7;

  // 周饮酒杯数
  const alcoholDrinksPerWeek = avgAlcoholDrinks * 7;

  // 计算BMI
  let bmi = 22; // 默认值
  if (weight && height && height > 0) {
    const heightInMeters = height / 100;
    bmi = weight / (heightInMeters * heightInMeters);
  }

  return {
    exerciseMinutesPerWeek,
    sleepHoursPerNight: avgSleepHours,
    dietQuality: avgDietQuality,
    stressLevel: avgStressLevel,
    smokingCigarettesPerDay: avgSmokingCigarettes,
    alcoholDrinksPerWeek,
    bmi,
    socialConnection: 5, // 默认值，需要用户输入
  };
}

/**
 * 获取改善建议
 * @param factors 生活方式因素
 * @param impact 生活方式影响结果
 * @returns 改善建议列表
 */
export interface ImprovementSuggestion {
  category: string;
  title: string;
  description: string;
  expectedBenefit: number; // 预期增加的寿命（年）
  priority: "high" | "medium" | "low";
  currentValue: number;
  targetValue: number;
}

export function getImprovementSuggestions(
  factors: LifestyleFactors,
  impact: LifestyleImpactResult
): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  // 1. 运动建议
  if (factors.exerciseMinutesPerWeek < 150) {
    const deficit = 150 - factors.exerciseMinutesPerWeek;
    const potentialBenefit = (deficit / 60) * 0.05;
    suggestions.push({
      category: "exercise",
      title: "增加运动时间",
      description: `目前每周运动${Math.round(factors.exerciseMinutesPerWeek)}分钟，建议增加至150分钟（每周5天，每天30分钟中等强度运动）`,
      expectedBenefit: Math.min(potentialBenefit, 2.5 - impact.exerciseAdjustment),
      priority: "high",
      currentValue: factors.exerciseMinutesPerWeek,
      targetValue: 150,
    });
  }

  // 2. 睡眠建议
  if (Math.abs(factors.sleepHoursPerNight - 7.5) > 0.5) {
    suggestions.push({
      category: "sleep",
      title: "调整睡眠时间",
      description: `目前每晚睡眠${factors.sleepHoursPerNight}小时，建议调整至7-8小时`,
      expectedBenefit: 1.5 - impact.sleepAdjustment,
      priority: "high",
      currentValue: factors.sleepHoursPerNight,
      targetValue: 7.5,
    });
  }

  // 3. 饮食建议
  if (factors.dietQuality < 8) {
    const potentialBenefit = (8 - factors.dietQuality) * 0.3;
    suggestions.push({
      category: "diet",
      title: "改善饮食质量",
      description: `目前饮食质量评分${factors.dietQuality}/10，建议增加蔬菜、水果、全谷物的摄入，减少加工食品`,
      expectedBenefit: potentialBenefit,
      priority: "high",
      currentValue: factors.dietQuality,
      targetValue: 8,
    });
  }

  // 4. 压力管理建议
  if (factors.stressLevel > 5) {
    const potentialBenefit = (factors.stressLevel - 3) * 0.15;
    suggestions.push({
      category: "stress",
      title: "减少压力",
      description: `目前压力水平${factors.stressLevel}/10，建议通过冥想、瑜伽或其他放松活动来降低压力`,
      expectedBenefit: potentialBenefit,
      priority: "medium",
      currentValue: factors.stressLevel,
      targetValue: 3,
    });
  }

  // 5. 戒烟建议
  if (factors.smokingCigarettesPerDay > 0) {
    const potentialBenefit = factors.smokingCigarettesPerDay * 0.15 + 8;
    suggestions.push({
      category: "smoking",
      title: "戒烟",
      description: `目前每天吸烟${Math.round(factors.smokingCigarettesPerDay)}支，建议完全戒烟`,
      expectedBenefit: potentialBenefit,
      priority: "high",
      currentValue: factors.smokingCigarettesPerDay,
      targetValue: 0,
    });
  }

  // 6. 限制饮酒建议
  const drinksPerDay = factors.alcoholDrinksPerWeek / 7;
  if (drinksPerDay > 1) {
    const potentialBenefit = Math.min((drinksPerDay - 1) * 0.2, 3);
    suggestions.push({
      category: "alcohol",
      title: "限制饮酒",
      description: `目前平均每天饮酒${drinksPerDay.toFixed(1)}杯，建议限制在1杯以内`,
      expectedBenefit: potentialBenefit,
      priority: "medium",
      currentValue: drinksPerDay,
      targetValue: 1,
    });
  }

  // 7. BMI调整建议
  if (factors.bmi < 18.5 || factors.bmi > 24.9) {
    const targetBmi = 22;
    const potentialBenefit = 2 - Math.abs(factors.bmi - targetBmi) * 0.2;
    suggestions.push({
      category: "weight",
      title: "调整体重",
      description: `目前BMI${factors.bmi.toFixed(1)}，建议调整至18.5-24.9（正常范围）`,
      expectedBenefit: potentialBenefit,
      priority: "medium",
      currentValue: factors.bmi,
      targetValue: targetBmi,
    });
  }

  // 按优先级和潜在收益排序
  suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.expectedBenefit - a.expectedBenefit;
  });

  return suggestions;
}
