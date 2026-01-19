import { describe, it, expect } from "vitest";
import {
  calculateLifespanPrediction,
  calculateCountdown,
  type LifespanPredictionInput,
} from "./lifespanPrediction";

describe("Lifespan Prediction Calculation", () => {
  describe("calculateLifespanPrediction", () => {
    it("should calculate lifespan prediction with basic input", () => {
      const input: LifespanPredictionInput = {
        age: 35,
        gender: "male",
      };

      const result = calculateLifespanPrediction(input);

      expect(result.baseLifeExpectancy).toBeGreaterThan(0);
      expect(result.biologicalAge).toBe(input.age);
      expect(result.estimatedLifeExpectancy).toBeGreaterThan(input.age);
      expect(result.remainingYears).toBeGreaterThan(0);
      expect(result.remainingDays).toBeGreaterThan(0);
      expect(result.healthScore).toBeGreaterThanOrEqual(0);
      expect(result.healthScore).toBeLessThanOrEqual(100);
    });

    it("should calculate lifespan prediction with biomarker data", () => {
      const input: LifespanPredictionInput = {
        age: 45,
        gender: "female",
        biomarker: {
          id: 1,
          healthReportId: 1,
          userId: 1,
          glucose: "90",
          creatinine: "1.0",
          albumin: "4.2",
          lymphocytePercent: "25",
          cReactiveProtein: "1.5",
          redCellDistributionWidth: "12.5",
          meanPlateletVolume: "8.5",
          whiteBloodCellCount: "7.0",
          systolicBP: "120",
          biologicalAge: "45.5",
          biologicalAgeAccuracy: 95,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      };

      const result = calculateLifespanPrediction(input);

      expect(result.biologicalAge).toBeGreaterThan(0);
      expect(result.biomarkerAdjustment).toBeDefined();
      expect(result.biologicalAgeAccuracy).toBe(95);
    });

    it("should calculate lifespan prediction with lifestyle checkins", () => {
      const input: LifespanPredictionInput = {
        age: 40,
        gender: "male",
        recentCheckins: [
          {
            id: 1,
            userId: 1,
            checkInDate: "2024-01-01" as any,
            exerciseMinutes: 30,
            sleepHours: "7.5" as any,
            dietQuality: 8,
            stressLevel: 3,
            weight: "75" as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
        ],
      };

      const result = calculateLifespanPrediction(input);

      expect(result.lifestyleAdjustment).toBeDefined();
      expect(result.lifestyleScore).toBeGreaterThanOrEqual(0);
      expect(result.lifestyleScore).toBeLessThanOrEqual(100);
      expect(result.estimatedLifeExpectancy).toBeGreaterThan(input.age);
    });

    it("should handle different genders correctly", () => {
      const maleInput: LifespanPredictionInput = {
        age: 35,
        gender: "male",
      };
      const femaleInput: LifespanPredictionInput = {
        age: 35,
        gender: "female",
      };
      const otherInput: LifespanPredictionInput = {
        age: 35,
        gender: "other",
      };

      const maleResult = calculateLifespanPrediction(maleInput);
      const femaleResult = calculateLifespanPrediction(femaleInput);
      const otherResult = calculateLifespanPrediction(otherInput);

      // 女性通常比男性寿命更长
      expect(femaleResult.baseLifeExpectancy).toBeGreaterThan(maleResult.baseLifeExpectancy);
      expect(otherResult.baseLifeExpectancy).toBeGreaterThanOrEqual(maleResult.baseLifeExpectancy);
    });

    it("should adjust life expectancy based on biological age", () => {
      const input: LifespanPredictionInput = {
        age: 45,
        gender: "male",
        biomarker: {
          id: 1,
          healthReportId: 1,
          userId: 1,
          glucose: "150",
          creatinine: "1.5",
          albumin: "3.0",
          lymphocytePercent: "35",
          cReactiveProtein: "5.0",
          redCellDistributionWidth: "15",
          meanPlateletVolume: "10",
          whiteBloodCellCount: "9",
          systolicBP: "150",
          biologicalAge: "50",
          biologicalAgeAccuracy: 90,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      };

      const result = calculateLifespanPrediction(input);

      expect(result.biologicalAge).toBeGreaterThan(input.age);
      expect(result.biomarkerAdjustment).toBeLessThan(0); // 生物年龄大于实际年龄，应该减少预期寿命
    });
  });

  describe("calculateCountdown", () => {
    it("should calculate countdown correctly for given remaining years", () => {
      const remainingYears = 50;
      const countdown = calculateCountdown(remainingYears);

      expect(countdown.years).toBe(50);
      expect(countdown.months).toBeGreaterThanOrEqual(0);
      expect(countdown.days).toBeGreaterThanOrEqual(0);
      expect(countdown.hours).toBeGreaterThanOrEqual(0);
      expect(countdown.minutes).toBeGreaterThanOrEqual(0);
      expect(countdown.seconds).toBeGreaterThanOrEqual(0);
      expect(countdown.totalSeconds).toBeGreaterThan(0);
    });

    it("should handle zero remaining years", () => {
      const countdown = calculateCountdown(0);

      expect(countdown.years).toBe(0);
      expect(countdown.months).toBe(0);
      expect(countdown.days).toBe(0);
      expect(countdown.hours).toBe(0);
      expect(countdown.minutes).toBe(0);
      expect(countdown.seconds).toBe(0);
      expect(countdown.totalSeconds).toBe(0);
    });

    it("should calculate fractional years correctly", () => {
      const remainingYears = 1.5;
      const countdown = calculateCountdown(remainingYears);

      expect(countdown.years).toBe(1);
      expect(countdown.months).toBeGreaterThanOrEqual(0);
      expect(countdown.totalSeconds).toBeGreaterThan(0);
    });
  });
});