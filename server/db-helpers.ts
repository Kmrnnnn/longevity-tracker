/**
 * 数据库查询助手函数
 */

import { eq, desc, and, gte } from "drizzle-orm";
import { getDb } from "./db";
import {
  biomarkers,
  dailyCheckins,
  biologicalAgeHistory,
  lifespanPredictions,
  healthRecommendations,
  healthReports,
  type InsertBiomarker,
  type InsertDailyCheckin,
  type InsertBiologicalAgeHistory,
  type InsertLifespanPrediction,
  type InsertHealthRecommendation,
  type InsertHealthReport,
} from "../drizzle/schema";

/**
 * 创建生物标志物记录
 */
export async function createBiomarker(data: InsertBiomarker) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(biomarkers).values(data);
  return result;
}

/**
 * 获取用户最新的生物标志物记录
 */
export async function getLatestBiomarker(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(biomarkers)
    .where(eq(biomarkers.userId, userId))
    .orderBy(desc(biomarkers.createdAt))
    .limit(1);

  return result[0] || null;
}

/**
 * 获取用户的生物标志物历史
 */
export async function getBiomarkerHistory(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(biomarkers)
    .where(eq(biomarkers.userId, userId))
    .orderBy(desc(biomarkers.createdAt))
    .limit(limit);
}

/**
 * 创建每日打卡记录
 */
export async function createDailyCheckin(data: InsertDailyCheckin) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(dailyCheckins).values(data);
}

/**
 * 获取用户特定日期的打卡记录
 */
export async function getDailyCheckin(userId: number, date: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const dateStr = date.toISOString().split("T")[0];
  const result = await db
    .select()
    .from(dailyCheckins)
    .where(and(eq(dailyCheckins.userId, userId), eq(dailyCheckins.checkInDate, dateStr as any)))
    .limit(1);

  return result[0] || null;
}

/**
 * 获取用户最近N天的打卡记录
 */
export async function getRecentCheckins(userId: number, days = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const fromDateStr = fromDate.toISOString().split("T")[0];

  return await db
    .select()
    .from(dailyCheckins)
    .where(and(eq(dailyCheckins.userId, userId), gte(dailyCheckins.checkInDate, fromDateStr as any)))
    .orderBy(desc(dailyCheckins.checkInDate));
}

/**
 * 创建生物年龄历史记录
 */
export async function createBiologicalAgeHistory(data: InsertBiologicalAgeHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(biologicalAgeHistory).values(data);
}

/**
 * 获取用户的生物年龄历史
 */
export async function getBiologicalAgeHistory(userId: number, limit = 12) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(biologicalAgeHistory)
    .where(eq(biologicalAgeHistory.userId, userId))
    .orderBy(desc(biologicalAgeHistory.recordDate))
    .limit(limit);
}

/**
 * 创建寿命预测记录
 */
export async function createLifespanPrediction(data: InsertLifespanPrediction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(lifespanPredictions).values(data);
}

/**
 * 获取用户最新的寿命预测
 */
export async function getLatestLifespanPrediction(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(lifespanPredictions)
    .where(eq(lifespanPredictions.userId, userId))
    .orderBy(desc(lifespanPredictions.predictionDate))
    .limit(1);

  return result[0] || null;
}

/**
 * 获取用户的寿命预测历史
 */
export async function getLifespanPredictionHistory(userId: number, limit = 52) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(lifespanPredictions)
    .where(eq(lifespanPredictions.userId, userId))
    .orderBy(desc(lifespanPredictions.predictionDate))
    .limit(limit);
}

/**
 * 创建健康建议
 */
export async function createHealthRecommendation(data: InsertHealthRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(healthRecommendations).values(data);
}

/**
 * 获取用户的健康建议列表
 */
export async function getHealthRecommendations(userId: number, status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (status) {
    return await db
      .select()
      .from(healthRecommendations)
      .where(and(eq(healthRecommendations.userId, userId), eq(healthRecommendations.status, status as any)))
      .orderBy(desc(healthRecommendations.recommendationDate));
  }

  return await db
    .select()
    .from(healthRecommendations)
    .where(eq(healthRecommendations.userId, userId))
    .orderBy(desc(healthRecommendations.recommendationDate));
}

/**
 * 更新健康建议状态
 */
export async function updateRecommendationStatus(id: number, status: "pending" | "accepted" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(healthRecommendations)
    .set({ status, updatedAt: new Date() })
    .where(eq(healthRecommendations.id, id));
}

/**
 * 创建体检报告
 */
export async function createHealthReport(data: InsertHealthReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(healthReports).values(data);
}

/**
 * 获取用户的体检报告列表
 */
export async function getHealthReports(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(healthReports)
    .where(eq(healthReports.userId, userId))
    .orderBy(desc(healthReports.reportDate));
}

/**
 * 获取用户最新的体检报告
 */
export async function getLatestHealthReport(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(healthReports)
    .where(eq(healthReports.userId, userId))
    .orderBy(desc(healthReports.reportDate))
    .limit(1);

  return result[0] || null;
}
