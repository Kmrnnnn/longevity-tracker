import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as dbHelpers from "../db-helpers";
import { calculateLifespanPrediction, calculateCountdown } from "../calculations/lifespanPrediction";
import { parseHealthReport, convertToBiomarkerValues } from "../_core/healthReportParser";
import { storagePut } from "../storage";
import { calculateBiologicalAge } from "../calculations/biologicalAge";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const healthRouter = router({
  createDailyCheckin: protectedProcedure
    .input(
      z.object({
        checkInDate: z.string(),
        exerciseMinutes: z.number().optional(),
        sleepHours: z.number().optional(),
        dietQuality: z.number().optional(),
        stressLevel: z.number().optional(),
        weight: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await dbHelpers.createDailyCheckin({
        userId: ctx.user.id,
        checkInDate: input.checkInDate as any,
        exerciseMinutes: input.exerciseMinutes,
        sleepHours: input.sleepHours ? input.sleepHours.toString() : null,
        dietQuality: input.dietQuality,
        stressLevel: input.stressLevel,
        weight: input.weight ? input.weight.toString() : null,
      });
    }),

  getRecentCheckins: protectedProcedure
    .input(z.object({ days: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return await dbHelpers.getRecentCheckins(ctx.user.id, input.days || 30);
    }),

  getLatestBiomarker: protectedProcedure.query(async ({ ctx }) => {
    return await dbHelpers.getLatestBiomarker(ctx.user.id);
  }),

  getHealthReports: protectedProcedure.query(async ({ ctx }) => {
    return await dbHelpers.getHealthReports(ctx.user.id);
  }),

  uploadHealthReport: protectedProcedure
    .input(
      z.object({
        file: z.string(), // base64编码的文件数据
        fileName: z.string(),
        mimeType: z.string(),
        reportDate: z.string().optional(), // ISO日期字符串
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. 上传文件到存储
        const fileBuffer = Buffer.from(input.file, "base64");
        const fileKey = `health-reports/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url: fileUrl } = await storagePut(fileKey, fileBuffer, input.mimeType);

        // 2. 创建体检报告记录
        const reportDate = input.reportDate
          ? new Date(input.reportDate)
          : new Date();
        
        const healthReport = await dbHelpers.createHealthReport({
          userId: ctx.user.id,
          reportDate: reportDate.toISOString().split("T")[0] as any,
          reportType: "uploaded",
          sourceUrl: fileUrl,
        });

        // 3. 使用LLM解析体检报告
        const parseResult = await parseHealthReport(fileUrl, input.mimeType);

        // 4. 获取用户信息（年龄、性别）
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);
        const user = userResult[0];

        // 计算年龄
        let age = 35; // 默认值
        if (user?.dateOfBirth) {
          const birthDate = new Date(user.dateOfBirth as any);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        } else if (parseResult.biomarkers.age) {
          age = parseResult.biomarkers.age;
        }

        const gender = (user?.gender as "male" | "female" | "other") || "other";

        // 5. 转换生物标志物数据
        const biomarkerValues = convertToBiomarkerValues(parseResult.biomarkers, age);

        // 6. 计算生物年龄
        const biologicalAgeResult = calculateBiologicalAge(biomarkerValues);

        // 7. 创建生物标志物记录
        const biomarkerRecord = await dbHelpers.createBiomarker({
          userId: ctx.user.id,
          healthReportId: Number((healthReport as any)[0]?.insertId || healthReport),
          glucose: parseResult.biomarkers.glucose?.toString(),
          totalCholesterol: parseResult.biomarkers.totalCholesterol?.toString(),
          ldlCholesterol: parseResult.biomarkers.ldlCholesterol?.toString(),
          hdlCholesterol: parseResult.biomarkers.hdlCholesterol?.toString(),
          triglycerides: parseResult.biomarkers.triglycerides?.toString(),
          systolicBP: parseResult.biomarkers.systolicBP?.toString(),
          diastolicBP: parseResult.biomarkers.diastolicBP?.toString(),
          creatinine: parseResult.biomarkers.creatinine?.toString(),
          albumin: parseResult.biomarkers.albumin?.toString(),
          lymphocytePercent: parseResult.biomarkers.lymphocytePercent?.toString(),
          cReactiveProtein: parseResult.biomarkers.cReactiveProtein?.toString(),
          redCellDistributionWidth: parseResult.biomarkers.redCellDistributionWidth?.toString(),
          meanPlateletVolume: parseResult.biomarkers.meanPlateletVolume?.toString(),
          whiteBloodCellCount: parseResult.biomarkers.whiteBloodCellCount?.toString(),
          biologicalAge: biologicalAgeResult.biologicalAge.toString(),
          biologicalAgeAccuracy: biologicalAgeResult.accuracy,
        });

        // 8. 更新体检报告的extractedAt字段
        // 注意：这需要数据库支持，暂时跳过

        return {
          success: true,
          healthReportId: Number((healthReport as any)[0]?.insertId || healthReport),
          biomarkerId: Number((biomarkerRecord as any)[0]?.insertId || biomarkerRecord),
          parseResult: {
            confidence: parseResult.confidence,
            extractedCount: Object.keys(parseResult.biomarkers).filter(
              (key) => parseResult.biomarkers[key as keyof typeof parseResult.biomarkers] !== undefined
            ).length,
            biologicalAge: biologicalAgeResult.biologicalAge,
            biologicalAgeAccuracy: biologicalAgeResult.accuracy,
          },
        };
      } catch (error: any) {
        console.error("上传体检报告失败:", error);
        throw new Error(`上传体检报告失败: ${error.message}`);
      }
    }),

  getLifespanPrediction: protectedProcedure.query(async ({ ctx }) => {
    const biomarker = await dbHelpers.getLatestBiomarker(ctx.user.id);
    const recentCheckins = await dbHelpers.getRecentCheckins(ctx.user.id, 30);

    // 获取用户年龄和性别
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);
    const user = userResult[0];

    let age = 35;
    if (user?.dateOfBirth) {
      const birthDate = new Date(user.dateOfBirth as any);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    const gender = (user?.gender as "male" | "female" | "other") || "other";

    const prediction = calculateLifespanPrediction({
      age,
      gender,
      biomarker: biomarker || undefined,
      recentCheckins: recentCheckins || [],
    });

    const countdown = calculateCountdown(prediction.remainingYears);

    return {
      ...prediction,
      countdown,
    };
  }),

  getHealthRecommendations: protectedProcedure.query(async ({ ctx }) => {
    return await dbHelpers.getHealthRecommendations(ctx.user.id);
  }),
});
