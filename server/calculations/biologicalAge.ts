/**
 * 生物年龄计算引擎
 * 基于PhenoAge模型，使用9个关键生物标志物计算生物年龄
 * 参考文献: Levine ME, et al. An epigenetic biomarker of aging for lifespan & healthspan. Aging (Albany NY). 2018
 */

import type { Biomarker } from "../../drizzle/schema";

export interface BiomarkerValues {
  age: number; // 实际年龄
  albumin?: number; // 白蛋白 (g/dL)
  lymphocytePercent?: number; // 淋巴细胞百分比 (%)
  creatinine?: number; // 肌酐 (mg/dL)
  glucose?: number; // 血糖 (mg/dL)
  cReactiveProtein?: number; // C反应蛋白 (mg/L)
  redCellDistributionWidth?: number; // 红细胞分布宽度 (%)
  meanPlateletVolume?: number; // 平均血小板体积 (fL)
  whiteBloodCellCount?: number; // 白细胞计数 (K/uL)
  systolicBP?: number; // 收缩压 (mmHg)
}

export interface BiologicalAgeResult {
  biologicalAge: number; // 计算得出的生物年龄
  chronologicalAgeDifference: number; // 生物年龄 - 实际年龄 (负数表示年轻，正数表示老化)
  accuracy: number; // 准确度评分 0-100
  missingBiomarkers: string[]; // 缺失的生物标志物列表
}

/**
 * PhenoAge模型常数和系数
 * 这些值来自原始研究论文
 */
const PHENOAGE_INTERCEPT = 141.50;
const PHENOAGE_COEFFICIENTS = {
  age: 0.00368,
  albumin: -0.465,
  lymphocytePercent: 0.0619,
  creatinine: 0.0917,
  glucose: 0.00720,
  cReactiveProtein: 0.0305,
  redCellDistributionWidth: 0.0268,
  meanPlateletVolume: 0.00573,
  whiteBloodCellCount: 0.0468,
  systolicBP: 0.00163,
};

/**
 * 计算生物年龄（PhenoAge模型）
 * @param biomarkers 生物标志物值
 * @returns 生物年龄计算结果
 */
export function calculateBiologicalAge(biomarkers: BiomarkerValues): BiologicalAgeResult {
  const missingBiomarkers: string[] = [];
  let usedBiomarkerCount = 0;
  const totalBiomarkerCount = 9;

  // 初始化计算值
  let phenoAge = PHENOAGE_INTERCEPT;

  // 年龄项
  phenoAge += PHENOAGE_COEFFICIENTS.age * biomarkers.age;
  usedBiomarkerCount++;

  // 白蛋白
  if (biomarkers.albumin !== undefined && biomarkers.albumin !== null) {
    phenoAge += PHENOAGE_COEFFICIENTS.albumin * biomarkers.albumin;
    usedBiomarkerCount++;
  } else {
    missingBiomarkers.push("albumin");
  }

  // 淋巴细胞百分比
  if (biomarkers.lymphocytePercent !== undefined && biomarkers.lymphocytePercent !== null) {
    phenoAge += PHENOAGE_COEFFICIENTS.lymphocytePercent * biomarkers.lymphocytePercent;
    usedBiomarkerCount++;
  } else {
    missingBiomarkers.push("lymphocytePercent");
  }

  // 肌酐
  if (biomarkers.creatinine !== undefined && biomarkers.creatinine !== null) {
    phenoAge += PHENOAGE_COEFFICIENTS.creatinine * biomarkers.creatinine;
    usedBiomarkerCount++;
  } else {
    missingBiomarkers.push("creatinine");
  }

  // 血糖
  if (biomarkers.glucose !== undefined && biomarkers.glucose !== null) {
    phenoAge += PHENOAGE_COEFFICIENTS.glucose * biomarkers.glucose;
    usedBiomarkerCount++;
  } else {
    missingBiomarkers.push("glucose");
  }

  // C反应蛋白
  if (biomarkers.cReactiveProtein !== undefined && biomarkers.cReactiveProtein !== null) {
    phenoAge += PHENOAGE_COEFFICIENTS.cReactiveProtein * biomarkers.cReactiveProtein;
    usedBiomarkerCount++;
  } else {
    missingBiomarkers.push("cReactiveProtein");
  }

  // 红细胞分布宽度
  if (biomarkers.redCellDistributionWidth !== undefined && biomarkers.redCellDistributionWidth !== null) {
    phenoAge += PHENOAGE_COEFFICIENTS.redCellDistributionWidth * biomarkers.redCellDistributionWidth;
    usedBiomarkerCount++;
  } else {
    missingBiomarkers.push("redCellDistributionWidth");
  }

  // 平均血小板体积
  if (biomarkers.meanPlateletVolume !== undefined && biomarkers.meanPlateletVolume !== null) {
    phenoAge += PHENOAGE_COEFFICIENTS.meanPlateletVolume * biomarkers.meanPlateletVolume;
    usedBiomarkerCount++;
  } else {
    missingBiomarkers.push("meanPlateletVolume");
  }

  // 白细胞计数
  if (biomarkers.whiteBloodCellCount !== undefined && biomarkers.whiteBloodCellCount !== null) {
    phenoAge += PHENOAGE_COEFFICIENTS.whiteBloodCellCount * biomarkers.whiteBloodCellCount;
    usedBiomarkerCount++;
  } else {
    missingBiomarkers.push("whiteBloodCellCount");
  }

  // 收缩压
  if (biomarkers.systolicBP !== undefined && biomarkers.systolicBP !== null) {
    phenoAge += PHENOAGE_COEFFICIENTS.systolicBP * biomarkers.systolicBP;
    usedBiomarkerCount++;
  } else {
    missingBiomarkers.push("systolicBP");
  }

  // 计算准确度评分（基于可用的生物标志物数量）
  // 如果有9个标志物，准确度为100；每缺少一个，准确度降低约10-15%
  const accuracy = Math.max(40, Math.round((usedBiomarkerCount / totalBiomarkerCount) * 100));

  // 计算生物年龄与实际年龄的差异
  const chronologicalAgeDifference = phenoAge - biomarkers.age;

  return {
    biologicalAge: Math.round(phenoAge * 100) / 100,
    chronologicalAgeDifference: Math.round(chronologicalAgeDifference * 100) / 100,
    accuracy,
    missingBiomarkers,
  };
}

/**
 * 根据生物年龄调整预期寿命
 * @param baseLifeExpectancy 基础预期寿命（年）
 * @param biologicalAge 生物年龄（年）
 * @param chronologicalAge 实际年龄（年）
 * @returns 调整后的预期寿命（年）
 */
export function adjustLifeExpectancyByBiologicalAge(
  baseLifeExpectancy: number,
  biologicalAge: number,
  chronologicalAge: number
): number {
  // 生物年龄每老化1岁，预期寿命减少0.5年
  // 如果生物年龄 > 实际年龄，说明老化加速，应该减少寿命
  const agingAccelerationFactor = 0.5;
  const ageDifference = biologicalAge - chronologicalAge;
  const adjustment = -ageDifference * agingAccelerationFactor; // 注意负号

  return Math.max(0, baseLifeExpectancy + adjustment);
}

/**
 * 计算健康评分（基于生物标志物）
 * 评分范围：0-100，100表示最健康
 * @param biomarkers 生物标志物值
 * @returns 健康评分
 */
export function calculateHealthScoreFromBiomarkers(biomarkers: BiomarkerValues): number {
  let score = 100;
  let assessmentCount = 0;

  // 血糖评分（正常范围：70-100 mg/dL）
  if (biomarkers.glucose !== undefined && biomarkers.glucose !== null) {
    if (biomarkers.glucose < 70 || biomarkers.glucose > 100) {
      const deviation = Math.min(Math.abs(biomarkers.glucose - 85), 50);
      score -= (deviation / 50) * 15;
    }
    assessmentCount++;
  }

  // 肌酐评分（正常范围：0.7-1.3 mg/dL）
  if (biomarkers.creatinine !== undefined && biomarkers.creatinine !== null) {
    if (biomarkers.creatinine < 0.7 || biomarkers.creatinine > 1.3) {
      const deviation = Math.min(Math.abs(biomarkers.creatinine - 1.0), 0.5);
      score -= (deviation / 0.5) * 10;
    }
    assessmentCount++;
  }

  // 白蛋白评分（正常范围：3.5-5.0 g/dL）
  if (biomarkers.albumin !== undefined && biomarkers.albumin !== null) {
    if (biomarkers.albumin < 3.5 || biomarkers.albumin > 5.0) {
      const deviation = Math.min(Math.abs(biomarkers.albumin - 4.2), 1);
      score -= (deviation / 1) * 10;
    }
    assessmentCount++;
  }

  // C反应蛋白评分（正常范围：<3.0 mg/L）
  if (biomarkers.cReactiveProtein !== undefined && biomarkers.cReactiveProtein !== null) {
    if (biomarkers.cReactiveProtein > 3.0) {
      const deviation = Math.min(biomarkers.cReactiveProtein - 3.0, 10);
      score -= (deviation / 10) * 15;
    }
    assessmentCount++;
  }

  // 收缩压评分（正常范围：<120 mmHg）
  if (biomarkers.systolicBP !== undefined && biomarkers.systolicBP !== null) {
    if (biomarkers.systolicBP > 120) {
      const deviation = Math.min(biomarkers.systolicBP - 120, 40);
      score -= (deviation / 40) * 20;
    }
    assessmentCount++;
  }

  // 如果没有任何评估数据，返回中等评分
  if (assessmentCount === 0) {
    return 50;
  }

  return Math.max(0, Math.round(score));
}
