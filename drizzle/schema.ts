import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  dateOfBirth: date("dateOfBirth"),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 体检报告表
export const healthReports = mysqlTable("health_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reportDate: date("reportDate").notNull(),
  reportType: mysqlEnum("reportType", ["manual", "uploaded"]).default("manual").notNull(),
  sourceUrl: text("sourceUrl"),
  extractedAt: timestamp("extractedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HealthReport = typeof healthReports.$inferSelect;
export type InsertHealthReport = typeof healthReports.$inferInsert;

// 生物标志物数据表
export const biomarkers = mysqlTable("biomarkers", {
  id: int("id").autoincrement().primaryKey(),
  healthReportId: int("healthReportId").notNull(),
  userId: int("userId").notNull(),
  // 血液指标
  glucose: decimal("glucose", { precision: 6, scale: 2 }),
  totalCholesterol: decimal("totalCholesterol", { precision: 6, scale: 2 }),
  ldlCholesterol: decimal("ldlCholesterol", { precision: 6, scale: 2 }),
  hdlCholesterol: decimal("hdlCholesterol", { precision: 6, scale: 2 }),
  triglycerides: decimal("triglycerides", { precision: 6, scale: 2 }),
  // 血压
  systolicBP: decimal("systolicBP", { precision: 6, scale: 2 }),
  diastolicBP: decimal("diastolicBP", { precision: 6, scale: 2 }),
  // 肾脏和肝脏功能
  creatinine: decimal("creatinine", { precision: 6, scale: 2 }),
  albumin: decimal("albumin", { precision: 6, scale: 2 }),
  // 血细胞指标
  lymphocytePercent: decimal("lymphocytePercent", { precision: 6, scale: 2 }),
  cReactiveProtein: decimal("cReactiveProtein", { precision: 6, scale: 2 }),
  redCellDistributionWidth: decimal("redCellDistributionWidth", { precision: 6, scale: 2 }),
  meanPlateletVolume: decimal("meanPlateletVolume", { precision: 6, scale: 2 }),
  whiteBloodCellCount: decimal("whiteBloodCellCount", { precision: 6, scale: 2 }),
  // 计算结果
  biologicalAge: decimal("biologicalAge", { precision: 6, scale: 2 }),
  biologicalAgeAccuracy: int("biologicalAgeAccuracy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Biomarker = typeof biomarkers.$inferSelect;
export type InsertBiomarker = typeof biomarkers.$inferInsert;

// 每日打卡记录表
export const dailyCheckins = mysqlTable("daily_checkins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  checkInDate: date("checkInDate").notNull(),
  exerciseMinutes: int("exerciseMinutes"),
  exerciseIntensity: mysqlEnum("exerciseIntensity", ["light", "moderate", "vigorous"]),
  sleepHours: decimal("sleepHours", { precision: 4, scale: 1 }),
  sleepQuality: int("sleepQuality"),
  dietQuality: int("dietQuality"),
  dietDescription: text("dietDescription"),
  stressLevel: int("stressLevel"),
  smokingCigarettes: int("smokingCigarettes"),
  alcoholDrinks: decimal("alcoholDrinks", { precision: 4, scale: 1 }),
  weight: decimal("weight", { precision: 6, scale: 2 }),
  mood: int("mood"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type InsertDailyCheckin = typeof dailyCheckins.$inferInsert;

// 生物年龄历史表
export const biologicalAgeHistory = mysqlTable("biological_age_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recordDate: date("recordDate").notNull(),
  biologicalAge: decimal("biologicalAge", { precision: 6, scale: 2 }).notNull(),
  chronologicalAge: decimal("chronologicalAge", { precision: 6, scale: 2 }),
  healthScore: int("healthScore"),
  estimatedLifeExpectancy: decimal("estimatedLifeExpectancy", { precision: 6, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BiologicalAgeHistory = typeof biologicalAgeHistory.$inferSelect;
export type InsertBiologicalAgeHistory = typeof biologicalAgeHistory.$inferInsert;

// 寿命预测历史表
export const lifespanPredictions = mysqlTable("lifespan_predictions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  predictionDate: date("predictionDate").notNull(),
  baseLifeExpectancy: decimal("baseLifeExpectancy", { precision: 6, scale: 2 }),
  lifestyleAdjustment: decimal("lifestyleAdjustment", { precision: 6, scale: 2 }),
  biomarkerAdjustment: decimal("biomarkerAdjustment", { precision: 6, scale: 2 }),
  estimatedLifeExpectancy: decimal("estimatedLifeExpectancy", { precision: 6, scale: 2 }).notNull(),
  remainingYears: decimal("remainingYears", { precision: 6, scale: 2 }),
  healthScore: int("healthScore"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LifespanPrediction = typeof lifespanPredictions.$inferSelect;
export type InsertLifespanPrediction = typeof lifespanPredictions.$inferInsert;

// 健康建议表
export const healthRecommendations = mysqlTable("health_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recommendationDate: date("recommendationDate").notNull(),
  category: mysqlEnum("category", ["exercise", "diet", "sleep", "stress", "smoking", "alcohol", "weight"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  expectedBenefit: decimal("expectedBenefit", { precision: 6, scale: 2 }),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium"),
  status: mysqlEnum("status", ["pending", "accepted", "completed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HealthRecommendation = typeof healthRecommendations.$inferSelect;
export type InsertHealthRecommendation = typeof healthRecommendations.$inferInsert;