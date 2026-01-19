/**
 * 寿命预测计算引擎
 * 综合生物标志物和生活方式因素计算预期寿命
 */

import type { DailyCheckin, Biomarker } from "../../drizzle/schema";
import { calculateBiologicalAge, adjustLifeExpectancyByBiologicalAge } from "./biologicalAge";
import { calculateLifestyleImpact, aggregateLifestyleFactors, type LifestyleFactors } from "./lifestyleImpact";

export interface LifespanPredictionInput {
  age: number; // 实际年龄
  gender: "male" | "female" | "other";
  biomarker?: Biomarker; // 最新生物标志物
  recentCheckins?: DailyCheckin[]; // 最近30天的打卡记录
  weight?: number; // 体重（kg）
  height?: number; // 身高（cm）
}

export interface LifespanPredictionResult {
  baseLifeExpectancy: number; // 基础预期寿命（基于性别和年龄）
  biologicalAge: number; // 生物年龄
  biomarkerAdjustment: number; // 生物标志物调整（年）
  lifestyleAdjustment: number; // 生活方式调整（年）
  estimatedLifeExpectancy: number; // 最终预期寿命
  remainingYears: number; // 剩余寿命
  remainingDays: number; // 剩余天数
  healthScore: number; // 健康评分（0-100）
  lifestyleScore: number; // 生活方式评分（0-100）
  biologicalAgeAccuracy: number; // 生物年龄计算准确度
}

/**
 * 获取基础预期寿命
 * 基于性别和全球平均数据
 */
function getBaseLifeExpectancy(gender: "male" | "female" | "other", age: number): number {
  // 基础预期寿命（出生时）
  let baseExpectancy = 0;

  if (gender === "male") {
    baseExpectancy = 76; // 全球男性平均寿命
  } else if (gender === "female") {
    baseExpectancy = 81; // 全球女性平均寿命
  } else {
    baseExpectancy = 78.5; // 平均值
  }

  // 如果已经活到了某个年龄，调整预期寿命
  // 这是一个简化的模型，实际应该使用更复杂的生命表
  if (age > 0) {
    // 生存到当前年龄的人，平均还能再活的年数会更长
    // 使用简单的线性调整
    const additionalYears = Math.max(0, baseExpectancy - age);
    return age + additionalYears;
  }

  return baseExpectancy;
}

/**
 * 计算寿命预测
 */
export function calculateLifespanPrediction(input: LifespanPredictionInput): LifespanPredictionResult {
  const baseLifeExpectancy = getBaseLifeExpectancy(input.gender, input.age);

  let biologicalAge = input.age;
  let biomarkerAdjustment = 0;
  let biologicalAgeAccuracy = 0;

  // 如果有生物标志物数据，计算生物年龄调整
  if (input.biomarker) {
    const biomarkerValues = {
      age: input.age,
      albumin: input.biomarker.albumin ? Number(input.biomarker.albumin) : undefined,
      lymphocytePercent: input.biomarker.lymphocytePercent ? Number(input.biomarker.lymphocytePercent) : undefined,
      creatinine: input.biomarker.creatinine ? Number(input.biomarker.creatinine) : undefined,
      glucose: input.biomarker.glucose ? Number(input.biomarker.glucose) : undefined,
      cReactiveProtein: input.biomarker.cReactiveProtein ? Number(input.biomarker.cReactiveProtein) : undefined,
      redCellDistributionWidth: input.biomarker.redCellDistributionWidth
        ? Number(input.biomarker.redCellDistributionWidth)
        : undefined,
      meanPlateletVolume: input.biomarker.meanPlateletVolume ? Number(input.biomarker.meanPlateletVolume) : undefined,
      whiteBloodCellCount: input.biomarker.whiteBloodCellCount ? Number(input.biomarker.whiteBloodCellCount) : undefined,
      systolicBP: input.biomarker.systolicBP ? Number(input.biomarker.systolicBP) : undefined,
    };

    const biomarkerResult = calculateBiologicalAge(biomarkerValues);
    biologicalAge = biomarkerResult.biologicalAge;
    biologicalAgeAccuracy = biomarkerResult.accuracy;

    // 根据生物年龄调整预期寿命
    const adjustedExpectancy = adjustLifeExpectancyByBiologicalAge(baseLifeExpectancy, biologicalAge, input.age);
    biomarkerAdjustment = adjustedExpectancy - baseLifeExpectancy;
  }

  // 计算生活方式调整
  let lifestyleAdjustment = 0;
  let lifestyleScore = 50;

  if (input.recentCheckins && input.recentCheckins.length > 0) {
    const lifestyleFactors = aggregateLifestyleFactors(input.recentCheckins, input.weight, input.height);
    const lifestyleImpact = calculateLifestyleImpact(lifestyleFactors);

    lifestyleAdjustment = lifestyleImpact.totalAdjustment;
    lifestyleScore = lifestyleImpact.lifestyleScore;
  }

  // 计算最终预期寿命
  const estimatedLifeExpectancy = baseLifeExpectancy + biomarkerAdjustment + lifestyleAdjustment;

  // 计算剩余寿命
  const remainingYears = Math.max(0, estimatedLifeExpectancy - input.age);
  const remainingDays = Math.round(remainingYears * 365.25);

  // 计算综合健康评分
  const healthScore = calculateHealthScore(biologicalAge, input.age, lifestyleScore, biologicalAgeAccuracy);

  return {
    baseLifeExpectancy: Math.round(baseLifeExpectancy * 100) / 100,
    biologicalAge: Math.round(biologicalAge * 100) / 100,
    biomarkerAdjustment: Math.round(biomarkerAdjustment * 100) / 100,
    lifestyleAdjustment: Math.round(lifestyleAdjustment * 100) / 100,
    estimatedLifeExpectancy: Math.round(estimatedLifeExpectancy * 100) / 100,
    remainingYears: Math.round(remainingYears * 100) / 100,
    remainingDays,
    healthScore,
    lifestyleScore,
    biologicalAgeAccuracy,
  };
}

/**
 * 计算综合健康评分
 */
function calculateHealthScore(
  biologicalAge: number,
  chronologicalAge: number,
  lifestyleScore: number,
  biomarkerAccuracy: number
): number {
  // 生物年龄评分（0-40分）
  const ageDifference = biologicalAge - chronologicalAge;
  let biomarkerScore = 40;
  if (ageDifference > 5) {
    biomarkerScore = Math.max(0, 40 - (ageDifference - 5) * 2);
  } else if (ageDifference < -5) {
    biomarkerScore = 40 + Math.min(0, (ageDifference + 5) * 2);
  }

  // 生活方式评分权重（0-40分）
  const lifestyleWeightedScore = (lifestyleScore / 100) * 40;

  // 数据准确度评分（0-20分）
  const accuracyScore = (biomarkerAccuracy / 100) * 20;

  const totalScore = biomarkerScore + lifestyleWeightedScore + accuracyScore;
  return Math.round(Math.min(100, Math.max(0, totalScore)));
}

/**
 * 计算寿命倒计时
 */
export interface LifespanCountdown {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function calculateCountdown(remainingYears: number): LifespanCountdown {
  const totalSeconds = Math.round(remainingYears * 365.25 * 24 * 60 * 60);

  const years = Math.floor(totalSeconds / (365.25 * 24 * 60 * 60));
  const remainingAfterYears = totalSeconds % (365.25 * 24 * 60 * 60);

  const months = Math.floor(remainingAfterYears / (30.44 * 24 * 60 * 60));
  const remainingAfterMonths = remainingAfterYears % (30.44 * 24 * 60 * 60);

  const days = Math.floor(remainingAfterMonths / (24 * 60 * 60));
  const remainingAfterDays = remainingAfterMonths % (24 * 60 * 60);

  const hours = Math.floor(remainingAfterDays / (60 * 60));
  const remainingAfterHours = remainingAfterDays % (60 * 60);

  const minutes = Math.floor(remainingAfterHours / 60);
  const seconds = Math.floor(remainingAfterHours % 60);

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
  };
}
