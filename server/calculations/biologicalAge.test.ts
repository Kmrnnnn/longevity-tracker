import { describe, it, expect } from "vitest";
import {
  calculateBiologicalAge,
  adjustLifeExpectancyByBiologicalAge,
  calculateHealthScoreFromBiomarkers,
  type BiomarkerValues,
} from "./biologicalAge";

describe("Biological Age Calculation", () => {
  describe("calculateBiologicalAge", () => {
    it("should calculate biological age with all biomarkers", () => {
      const biomarkers: BiomarkerValues = {
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

      const result = calculateBiologicalAge(biomarkers);

      expect(result.biologicalAge).toBeDefined();
      expect(result.biologicalAge).toBeGreaterThan(0);
      expect(result.accuracy).toBeGreaterThanOrEqual(95);
      expect(result.missingBiomarkers.length).toBeLessThanOrEqual(1);
    });

    it("should handle missing biomarkers gracefully", () => {
      const biomarkers: BiomarkerValues = {
        age: 45,
        glucose: 95,
        creatinine: 1.0,
      };

      const result = calculateBiologicalAge(biomarkers);

      expect(result.biologicalAge).toBeDefined();
      expect(result.accuracy).toBeLessThan(100);
      expect(result.missingBiomarkers.length).toBeGreaterThan(0);
    });

    it("should calculate positive age difference for accelerated aging", () => {
      const biomarkers: BiomarkerValues = {
        age: 45,
        albumin: 3.0,
        lymphocytePercent: 35,
        creatinine: 1.5,
        glucose: 150,
        cReactiveProtein: 5.0,
        redCellDistributionWidth: 15,
        meanPlateletVolume: 10,
        whiteBloodCellCount: 9,
        systolicBP: 150,
      };

      const result = calculateBiologicalAge(biomarkers);

      expect(result.chronologicalAgeDifference).toBeGreaterThan(0);
      expect(result.biologicalAge).toBeGreaterThan(biomarkers.age);
    });
  });

  describe("adjustLifeExpectancyByBiologicalAge", () => {
    it("should reduce life expectancy for accelerated aging", () => {
      const baseExpectancy = 80;
      const biologicalAge = 50;
      const chronologicalAge = 45;

      const adjusted = adjustLifeExpectancyByBiologicalAge(baseExpectancy, biologicalAge, chronologicalAge);

      expect(adjusted).toBeLessThan(baseExpectancy);
      expect(adjusted).toBeGreaterThan(0);
    });

    it("should increase life expectancy for slower aging", () => {
      const baseExpectancy = 80;
      const biologicalAge = 40;
      const chronologicalAge = 45;

      const adjusted = adjustLifeExpectancyByBiologicalAge(baseExpectancy, biologicalAge, chronologicalAge);

      expect(adjusted).toBeGreaterThan(baseExpectancy);
    });

    it("should return base expectancy when biological age equals chronological age", () => {
      const baseExpectancy = 80;
      const biologicalAge = 45;
      const chronologicalAge = 45;

      const adjusted = adjustLifeExpectancyByBiologicalAge(baseExpectancy, biologicalAge, chronologicalAge);

      expect(adjusted).toBe(baseExpectancy);
    });
  });

  describe("calculateHealthScoreFromBiomarkers", () => {
    it("should return high score for optimal biomarkers", () => {
      const biomarkers: BiomarkerValues = {
        age: 45,
        glucose: 90,
        creatinine: 1.0,
        albumin: 4.2,
        cReactiveProtein: 1.0,
        systolicBP: 115,
      };

      const score = calculateHealthScoreFromBiomarkers(biomarkers);

      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should return lower score for poor biomarkers", () => {
      const biomarkers: BiomarkerValues = {
        age: 45,
        glucose: 200,
        creatinine: 2.0,
        albumin: 2.5,
        cReactiveProtein: 10,
        systolicBP: 180,
      };

      const score = calculateHealthScoreFromBiomarkers(biomarkers);

      expect(score).toBeLessThan(80);
    });

    it("should return default score for no biomarkers", () => {
      const biomarkers: BiomarkerValues = {
        age: 45,
      };

      const score = calculateHealthScoreFromBiomarkers(biomarkers);

      expect(score).toBe(50);
    });
  });
});
