/**
 * 体检报告解析器
 * 使用LLM解析体检报告文件，提取生物标志物数据
 */

import { invokeLLM } from "./llm";
import type { BiomarkerValues } from "../calculations/biologicalAge";

export interface ExtractedBiomarkers {
  // 血液指标
  glucose?: number; // 血糖（mg/dL）
  totalCholesterol?: number; // 总胆固醇（mg/dL）
  ldlCholesterol?: number; // LDL胆固醇（mg/dL）
  hdlCholesterol?: number; // HDL胆固醇（mg/dL）
  triglycerides?: number; // 甘油三酯（mg/dL）
  // 血压
  systolicBP?: number; // 收缩压（mmHg）
  diastolicBP?: number; // 舒张压（mmHg）
  // 肾脏和肝脏功能
  creatinine?: number; // 肌酐（mg/dL）
  albumin?: number; // 白蛋白（g/dL）
  // 血细胞指标
  lymphocytePercent?: number; // 淋巴细胞百分比（%）
  cReactiveProtein?: number; // C反应蛋白（mg/L）
  redCellDistributionWidth?: number; // 红细胞分布宽度（%）
  meanPlateletVolume?: number; // 平均血小板体积（fL）
  whiteBloodCellCount?: number; // 白细胞计数（K/uL）
  // 其他信息
  reportDate?: string; // 报告日期（ISO格式）
  age?: number; // 年龄（如果有）
  gender?: "male" | "female" | "other"; // 性别（如果有）
}

export interface HealthReportParsingResult {
  biomarkers: ExtractedBiomarkers;
  confidence: number; // 解析置信度 0-100
  extractedText?: string; // 提取的原始文本（如果支持）
  errors?: string[]; // 解析错误列表
}

/**
 * 使用LLM解析体检报告
 * @param fileUrl 体检报告文件URL（PDF或图片）
 * @param mimeType 文件MIME类型
 * @returns 解析后的生物标志物数据
 */
export async function parseHealthReport(
  fileUrl: string,
  mimeType: string = "application/pdf"
): Promise<HealthReportParsingResult> {
  // 定义输出schema
  const biomarkerSchema = {
    name: "extracted_biomarkers",
    schema: {
      type: "object",
      properties: {
        glucose: { type: "number", description: "血糖值（mg/dL）" },
        totalCholesterol: { type: "number", description: "总胆固醇（mg/dL）" },
        ldlCholesterol: { type: "number", description: "LDL胆固醇（mg/dL）" },
        hdlCholesterol: { type: "number", description: "HDL胆固醇（mg/dL）" },
        triglycerides: { type: "number", description: "甘油三酯（mg/dL）" },
        systolicBP: { type: "number", description: "收缩压（mmHg）" },
        diastolicBP: { type: "number", description: "舒张压（mmHg）" },
        creatinine: { type: "number", description: "肌酐（mg/dL）" },
        albumin: { type: "number", description: "白蛋白（g/dL）" },
        lymphocytePercent: { type: "number", description: "淋巴细胞百分比（%）" },
        cReactiveProtein: { type: "number", description: "C反应蛋白（mg/L）" },
        redCellDistributionWidth: { type: "number", description: "红细胞分布宽度（%）" },
        meanPlateletVolume: { type: "number", description: "平均血小板体积（fL）" },
        whiteBloodCellCount: { type: "number", description: "白细胞计数（K/uL）" },
        reportDate: { type: "string", description: "报告日期（ISO格式：YYYY-MM-DD）" },
        age: { type: "number", description: "年龄（岁）" },
        gender: { type: "string", enum: ["male", "female", "other"], description: "性别" },
      },
      additionalProperties: false,
    },
    strict: true,
  };

  // 构建LLM消息
  const messages = [
    {
      role: "system" as const,
      content:
        "你是一个专业的医疗数据分析助手，擅长从体检报告中提取生物标志物数据。请仔细阅读体检报告，提取所有可用的生物标志物数值，并返回结构化JSON数据。如果某个指标在报告中不存在或无法确定，请将其设为null。请确保数值单位正确（血糖mg/dL，胆固醇mg/dL，血压mmHg，肌酐mg/dL，白蛋白g/dL，C反应蛋白mg/L等）。",
    },
    {
      role: "user" as const,
      content: [
        {
          type: "file_url" as const,
          file_url: {
            url: fileUrl,
            mime_type: mimeType as any,
          },
        },
        {
          type: "text" as const,
          text: "请从这个体检报告中提取所有生物标志物数据。重点关注以下指标：血糖、总胆固醇、LDL胆固醇、HDL胆固醇、甘油三酯、收缩压、舒张压、肌酐、白蛋白、淋巴细胞百分比、C反应蛋白、红细胞分布宽度、平均血小板体积、白细胞计数。如果有报告日期、年龄或性别信息，也请一并提取。",
        },
      ],
    },
  ];

  try {
    // 调用LLM
    const response = await invokeLLM({
      messages,
      outputSchema: biomarkerSchema,
    });

    // 解析LLM返回的JSON
    const choice = response.choices[0];
    if (!choice || !choice.message.content) {
      throw new Error("LLM返回空响应");
    }

    let extractedData: any;
    if (typeof choice.message.content === "string") {
      extractedData = JSON.parse(choice.message.content);
    } else {
      // 处理内容数组
      const textContent = choice.message.content.find(
        (c) => c.type === "text"
      );
      if (textContent && textContent.type === "text") {
        extractedData = JSON.parse(textContent.text);
      } else {
        throw new Error("无法解析LLM返回的内容");
      }
    }

    // 验证和清理数据
    const biomarkers: ExtractedBiomarkers = {
      glucose: extractedData.glucose ?? undefined,
      totalCholesterol: extractedData.totalCholesterol ?? undefined,
      ldlCholesterol: extractedData.ldlCholesterol ?? undefined,
      hdlCholesterol: extractedData.hdlCholesterol ?? undefined,
      triglycerides: extractedData.triglycerides ?? undefined,
      systolicBP: extractedData.systolicBP ?? undefined,
      diastolicBP: extractedData.diastolicBP ?? undefined,
      creatinine: extractedData.creatinine ?? undefined,
      albumin: extractedData.albumin ?? undefined,
      lymphocytePercent: extractedData.lymphocytePercent ?? undefined,
      cReactiveProtein: extractedData.cReactiveProtein ?? undefined,
      redCellDistributionWidth: extractedData.redCellDistributionWidth ?? undefined,
      meanPlateletVolume: extractedData.meanPlateletVolume ?? undefined,
      whiteBloodCellCount: extractedData.whiteBloodCellCount ?? undefined,
      reportDate: extractedData.reportDate ?? undefined,
      age: extractedData.age ?? undefined,
      gender: extractedData.gender ?? undefined,
    };

    // 计算置信度（基于提取到的指标数量）
    const expectedFields = [
      "glucose",
      "totalCholesterol",
      "ldlCholesterol",
      "hdlCholesterol",
      "triglycerides",
      "systolicBP",
      "diastolicBP",
      "creatinine",
      "albumin",
      "lymphocytePercent",
      "cReactiveProtein",
      "redCellDistributionWidth",
      "meanPlateletVolume",
      "whiteBloodCellCount",
    ];
    const extractedCount = expectedFields.filter(
      (field) => biomarkers[field as keyof ExtractedBiomarkers] !== undefined
    ).length;
    const confidence = Math.round((extractedCount / expectedFields.length) * 100);

    return {
      biomarkers,
      confidence,
      extractedText: undefined, // 如果需要，可以从LLM响应中提取
      errors: [],
    };
  } catch (error: any) {
    console.error("解析体检报告失败:", error);
    return {
      biomarkers: {},
      confidence: 0,
      errors: [error.message || "解析失败"],
    };
  }
}

/**
 * 将提取的生物标志物转换为数据库格式
 */
export function convertToBiomarkerValues(
  extracted: ExtractedBiomarkers,
  age: number
): BiomarkerValues {
  return {
    age,
    albumin: extracted.albumin,
    lymphocytePercent: extracted.lymphocytePercent,
    creatinine: extracted.creatinine,
    glucose: extracted.glucose,
    cReactiveProtein: extracted.cReactiveProtein,
    redCellDistributionWidth: extracted.redCellDistributionWidth,
    meanPlateletVolume: extracted.meanPlateletVolume,
    whiteBloodCellCount: extracted.whiteBloodCellCount,
    systolicBP: extracted.systolicBP,
  };
}