/**
 * 健康数据集成测试
 * 测试完整的健康数据流程：上传体检报告 -> 解析 -> 计算生物年龄 -> 寿命预测
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  calculateLifespanPrediction,
  type LifespanPredictionInput,
} from "../calculations/lifespanPrediction";
import { calculateBiologicalAge, type BiomarkerValues } from "../calculations/biologicalAge";
import {
  calculateLifestyleImpact,
  aggregateLifestyleFactors,
  type LifestyleFactors,
} from "../calculations/lifestyleImpact";

describe("Health Data Integration Tests", () => {
  describe("Complete Health Data Flow", () => {
    it("should process complete health data flow: biomarker -> biological age -> lifespan prediction", () => {
      // 1. 准备生物标志物数据
      const biomarkerValues: BiomarkerValues = {
        age: 45,
        albumin: 4.2,
        lymphocytePercent: 25,
        creatinine: 1.0,
        glucose: 95,
        cReactiveProtein: 1.5,
        redCellDistributionWidth: 12.5,
        meanPlateletVolume: 8.5,
        whiteBloodCellCount: 7.0,
        systolicBP: 120,
      };

      // 2. 计算生物年龄
      const biologicalAgeResult = calculateBiologicalAge(biomarkerValues);

      expect(biologicalAgeResult.biologicalAge).toBeGreaterThan(0);
      expect(biologicalAgeResult.accuracy).toBeGreaterThan(80);

      // 3. 准备生活方式数据
      const lifestyleFactors: LifestyleFactors = {
        exerciseMinutesPerWeek: 150,
        sleepHoursPerNight: 7.5,
        dietQuality: 8,
        stressLevel: 3,
        smokingCigarettesPerDay: 0,
        alcoholDrinksPerWeek: 7,
        bmi: 22,
        socialConnection: 8,
      };

      // 4. 计算生活方式影响
      const lifestyleImpact = calculateLifestyleImpact(lifestyleFactors);

      expect(lifestyleImpact.totalAdjustment).toBeGreaterThan(0);
      expect(lifestyleImpact.lifestyleScore).toBeGreaterThan(70);

      // 5. 准备打卡数据
      const checkins = [
        {
          exerciseMinutes: 30,
          sleepHours: "7.5" as any,
          dietQuality: 8,
          stressLevel: 3,
          weight: "75" as any,
        } as any,
      ];

      // 6. 聚合生活方式因素
      const aggregatedFactors = aggregateLifestyleFactors(checkins, 75, 175);

      expect(aggregatedFactors.exerciseMinutesPerWeek).toBeGreaterThan(0);
      expect(aggregatedFactors.sleepHoursPerNight).toBeGreaterThan(0);

      // 7. 计算寿命预测
      const predictionInput: LifespanPredictionInput = {
        age: 45,
        gender: "male",
        biomarker: {
          id: 1,
          healthReportId: 1,
          userId: 1,
          glucose: biomarkerValues.glucose?.toString(),
          creatinine: biomarkerValues.creatinine?.toString(),
          albumin: biomarkerValues.albumin?.toString(),
          lymphocytePercent: biomarkerValues.lymphocytePercent?.toString(),
          cReactiveProtein: biomarkerValues.cReactiveProtein?.toString(),
          redCellDistributionWidth: biomarkerValues.redCellDistributionWidth?.toString(),
          meanPlateletVolume: biomarkerValues.meanPlateletVolume?.toString(),
          whiteBloodCellCount: biomarkerValues.whiteBloodCellCount?.toString(),
          systolicBP: biomarkerValues.systolicBP?.toString(),
          biologicalAge: biologicalAgeResult.biologicalAge.toString(),
          biologicalAgeAccuracy: biologicalAgeResult.accuracy,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
        recentCheckins: checkins,
      };

      const prediction = calculateLifespanPrediction(predictionInput);

      // 8. 验证结果
      expect(prediction.estimatedLifeExpectancy).toBeGreaterThan(predictionInput.age);
      expect(prediction.remainingYears).toBeGreaterThan(0);
      expect(prediction.healthScore).toBeGreaterThanOrEqual(0);
      expect(prediction.healthScore).toBeLessThanOrEqual(100);
      expect(prediction.biologicalAge).toBe(biologicalAgeResult.biologicalAge);
      expect(prediction.lifestyleScore).toBeGreaterThanOrEqual(0);
      expect(prediction.lifestyleScore).toBeLessThanOrEqual(100);
    });

    it("should handle missing biomarker data gracefully", () => {
      const predictionInput: LifespanPredictionInput = {
        age: 35,
        gender: "female",
        recentCheckins: [
          {
            exerciseMinutes: 150,
            sleepHours: "8" as any,
            dietQuality: 8,
            stressLevel: 3,
            weight: "65" as any,
          } as any,
        ],
      };

      const prediction = calculateLifespanPrediction(predictionInput);

      // 即使没有生物标志物数据，也应该能计算寿命预测
      expect(prediction.estimatedLifeExpectancy).toBeGreaterThan(predictionInput.age);
      expect(prediction.biologicalAge).toBe(predictionInput.age);
      expect(prediction.biomarkerAdjustment).toBe(0);
    });

    it("should handle missing lifestyle data gracefully", () => {
      const biomarkerValues: BiomarkerValues = {
        age: 40,
        glucose: 90,
        creatinine: 1.0,
        albumin: 4.2,
      };

      const biologicalAgeResult = calculateBiologicalAge(biomarkerValues);

      const predictionInput: LifespanPredictionInput = {
        age: 40,
        gender: "other",
        biomarker: {
          id: 1,
          healthReportId: 1,
          userId: 1,
          glucose: biomarkerValues.glucose?.toString(),
          creatinine: biomarkerValues.creatinine?.toString(),
          albumin: biomarkerValues.albumin?.toString(),
          biologicalAge: biologicalAgeResult.biologicalAge.toString(),
          biologicalAgeAccuracy: biologicalAgeResult.accuracy,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      };

      const prediction = calculateLifespanPrediction(predictionInput);

      // 即使没有生活方式数据，也应该能计算寿命预测
      expect(prediction.estimatedLifeExpectancy).toBeGreaterThan(predictionInput.age);
      expect(prediction.lifestyleAdjustment).toBe(0);
      expect(prediction.lifestyleScore).toBe(50); // 默认值
    });
  });

  describe("Data Consistency", () => {
    it("should maintain data consistency across calculations", () => {
      const age = 50;
      const gender = "male" as const;

      // 相同输入应该产生一致的生物年龄
      const biomarkerValues1: BiomarkerValues = {
        age,
        albumin: 4.0,
        lymphocytePercent: 30,
        creatinine: 1.1,
        glucose: 100,
        cReactiveProtein: 2.0,
        redCellDistributionWidth: 13.0,
        meanPlateletVolume: 9.0,
        whiteBloodCellCount: 7.5,
        systolicBP: 125,
      };

      const biomarkerValues2 = { ...biomarkerValues1 };

      const result1 = calculateBiologicalAge(biomarkerValues1);
      const result2 = calculateBiologicalAge(biomarkerValues2);

      expect(result1.biologicalAge).toBe(result2.biologicalAge);
      expect(result1.accuracy).toBe(result2.accuracy);

      // 相同的生活方式因素应该产生一致的影响
      const lifestyleFactors: LifestyleFactors = {
        exerciseMinutesPerWeek: 200,
        sleepHoursPerNight: 8,
        dietQuality: 9,
        stressLevel: 2,
        smokingCigarettesPerDay: 0,
        alcoholDrinksPerWeek: 7,
        bmi: 23,
        socialConnection: 9,
      };

      const impact1 = calculateLifestyleImpact(lifestyleFactors);
      const impact2 = calculateLifestyleImpact({ ...lifestyleFactors });

      expect(impact1.totalAdjustment).toBe(impact2.totalAdjustment);
      expect(impact1.lifestyleScore).toBe(impact2.lifestyleScore);
    });
  });
});