import { describe, it, expect } from "vitest";
import {
  calculateLifestyleImpact,
  aggregateLifestyleFactors,
  getImprovementSuggestions,
  type LifestyleFactors,
  type LifestyleImpactResult,
} from "./lifestyleImpact";

describe("Lifestyle Impact Calculation", () => {
  describe("calculateLifestyleImpact", () => {
    it("should calculate lifestyle impact with optimal factors", () => {
      const factors: LifestyleFactors = {
        exerciseMinutesPerWeek: 150,
        sleepHoursPerNight: 7.5,
        dietQuality: 10,
        stressLevel: 2,
        smokingCigarettesPerDay: 0,
        alcoholDrinksPerWeek: 7,
        bmi: 22,
        socialConnection: 10,
      };

      const result = calculateLifestyleImpact(factors);

      expect(result.totalAdjustment).toBeGreaterThan(0);
      expect(result.lifestyleScore).toBeGreaterThan(80);
      expect(result.exerciseAdjustment).toBeGreaterThan(0);
      expect(result.sleepAdjustment).toBeGreaterThan(0);
      expect(result.dietAdjustment).toBeGreaterThan(0);
    });

    it("should calculate negative adjustment for poor lifestyle", () => {
      const factors: LifestyleFactors = {
        exerciseMinutesPerWeek: 0,
        sleepHoursPerNight: 5,
        dietQuality: 3,
        stressLevel: 9,
        smokingCigarettesPerDay: 20,
        alcoholDrinksPerWeek: 21,
        bmi: 30,
        socialConnection: 2,
      };

      const result = calculateLifestyleImpact(factors);

      expect(result.smokingAdjustment).toBeLessThan(0);
      expect(result.stressAdjustment).toBeLessThan(1.5);
      expect(result.lifestyleScore).toBeLessThan(50);
    });

    it("should handle exercise impact correctly", () => {
      const lowExercise: LifestyleFactors = {
        exerciseMinutesPerWeek: 0,
        sleepHoursPerNight: 7.5,
        dietQuality: 8,
        stressLevel: 3,
        smokingCigarettesPerDay: 0,
        alcoholDrinksPerWeek: 7,
        bmi: 22,
        socialConnection: 8,
      };

      const highExercise: LifestyleFactors = {
        ...lowExercise,
        exerciseMinutesPerWeek: 300,
      };

      const lowResult = calculateLifestyleImpact(lowExercise);
      const highResult = calculateLifestyleImpact(highExercise);

      expect(highResult.exerciseAdjustment).toBeGreaterThan(lowResult.exerciseAdjustment);
      expect(highResult.exerciseAdjustment).toBeLessThanOrEqual(2.5);
    });

    it("should handle sleep impact correctly", () => {
      const poorSleep: LifestyleFactors = {
        exerciseMinutesPerWeek: 150,
        sleepHoursPerNight: 5,
        dietQuality: 8,
        stressLevel: 3,
        smokingCigarettesPerDay: 0,
        alcoholDrinksPerWeek: 7,
        bmi: 22,
        socialConnection: 8,
      };

      const optimalSleep: LifestyleFactors = {
        ...poorSleep,
        sleepHoursPerNight: 7.5,
      };

      const poorResult = calculateLifestyleImpact(poorSleep);
      const optimalResult = calculateLifestyleImpact(optimalSleep);

      expect(optimalResult.sleepAdjustment).toBeGreaterThan(poorResult.sleepAdjustment);
    });

    it("should handle smoking impact correctly", () => {
      const smoker: LifestyleFactors = {
        exerciseMinutesPerWeek: 150,
        sleepHoursPerNight: 7.5,
        dietQuality: 8,
        stressLevel: 3,
        smokingCigarettesPerDay: 20,
        alcoholDrinksPerWeek: 7,
        bmi: 22,
        socialConnection: 8,
      };

      const nonSmoker: LifestyleFactors = {
        ...smoker,
        smokingCigarettesPerDay: 0,
      };

      const smokerResult = calculateLifestyleImpact(smoker);
      const nonSmokerResult = calculateLifestyleImpact(nonSmoker);

      expect(nonSmokerResult.smokingAdjustment).toBeGreaterThan(smokerResult.smokingAdjustment);
      expect(smokerResult.smokingAdjustment).toBeLessThan(0);
    });

    it("should calculate lifestyle score correctly", () => {
      const factors: LifestyleFactors = {
        exerciseMinutesPerWeek: 150,
        sleepHoursPerNight: 7.5,
        dietQuality: 8,
        stressLevel: 3,
        smokingCigarettesPerDay: 0,
        alcoholDrinksPerWeek: 7,
        bmi: 22,
        socialConnection: 8,
      };

      const result = calculateLifestyleImpact(factors);

      expect(result.lifestyleScore).toBeGreaterThanOrEqual(0);
      expect(result.lifestyleScore).toBeLessThanOrEqual(100);
    });
  });

  describe("aggregateLifestyleFactors", () => {
    it("should aggregate checkins correctly", () => {
      const checkins = [
        {
          exerciseMinutes: 30,
          sleepHours: "8" as any,
          dietQuality: 8,
          stressLevel: 3,
          smokingCigarettes: 0,
          alcoholDrinks: "1" as any,
          weight: "75" as any,
        } as any,
        {
          exerciseMinutes: 45,
          sleepHours: "7" as any,
          dietQuality: 7,
          stressLevel: 4,
          smokingCigarettes: 0,
          alcoholDrinks: "0" as any,
          weight: "75" as any,
        } as any,
      ];

      const factors = aggregateLifestyleFactors(checkins, 75, 175);

      expect(factors.exerciseMinutesPerWeek).toBeGreaterThan(0);
      expect(factors.sleepHoursPerNight).toBeGreaterThan(0);
      expect(factors.dietQuality).toBeGreaterThan(0);
      expect(factors.bmi).toBeGreaterThan(0);
    });

    it("should handle empty checkins array", () => {
      const factors = aggregateLifestyleFactors([]);

      expect(factors.exerciseMinutesPerWeek).toBe(0);
      expect(factors.sleepHoursPerNight).toBe(7);
      expect(factors.dietQuality).toBe(5);
      expect(factors.stressLevel).toBe(5);
    });

    it("should calculate BMI correctly", () => {
      const checkins = [
        {
          weight: "75" as any,
        } as any,
      ];

      const factors = aggregateLifestyleFactors(checkins, 75, 175);

      expect(factors.bmi).toBeGreaterThan(0);
      expect(factors.bmi).toBeLessThan(30);
    });
  });

  describe("getImprovementSuggestions", () => {
    it("should generate suggestions for poor lifestyle", () => {
      const factors: LifestyleFactors = {
        exerciseMinutesPerWeek: 30,
        sleepHoursPerNight: 5,
        dietQuality: 4,
        stressLevel: 8,
        smokingCigarettesPerDay: 10,
        alcoholDrinksPerWeek: 14,
        bmi: 28,
        socialConnection: 3,
      };

      const impact = calculateLifestyleImpact(factors);
      const suggestions = getImprovementSuggestions(factors, impact);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].priority).toBe("high");
    });

    it("should prioritize high-impact improvements", () => {
      const factors: LifestyleFactors = {
        exerciseMinutesPerWeek: 30,
        sleepHoursPerNight: 5,
        dietQuality: 4,
        stressLevel: 8,
        smokingCigarettesPerDay: 20,
        alcoholDrinksPerWeek: 14,
        bmi: 28,
        socialConnection: 3,
      };

      const impact = calculateLifestyleImpact(factors);
      const suggestions = getImprovementSuggestions(factors, impact);

      // 吸烟应该是最优先的（影响最大）
      const smokingSuggestion = suggestions.find((s) => s.category === "smoking");
      expect(smokingSuggestion).toBeDefined();
      if (smokingSuggestion) {
        expect(smokingSuggestion.priority).toBe("high");
        expect(smokingSuggestion.expectedBenefit).toBeGreaterThan(0);
      }
    });

    it("should not generate suggestions for optimal lifestyle", () => {
      const factors: LifestyleFactors = {
        exerciseMinutesPerWeek: 200,
        sleepHoursPerNight: 7.5,
        dietQuality: 10,
        stressLevel: 2,
        smokingCigarettesPerDay: 0,
        alcoholDrinksPerWeek: 7,
        bmi: 22,
        socialConnection: 10,
      };

      const impact = calculateLifestyleImpact(factors);
      const suggestions = getImprovementSuggestions(factors, impact);

      // 对于最优生活方式，建议应该很少或没有
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });
  });
});