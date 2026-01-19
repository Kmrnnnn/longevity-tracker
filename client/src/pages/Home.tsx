import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LifespanCountdown } from "@/components/LifespanCountdown";
import { DailyCheckinForm } from "@/components/DailyCheckinForm";
import { HealthDashboard } from "@/components/HealthDashboard";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, Heart, TrendingUp, Calendar, Zap, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "checkin" | "dashboard">("overview");
  const [, setLocation] = useLocation();

  const { data: prediction, isLoading: predictionLoading } = trpc.health.getLifespanPrediction.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* 导航栏 */}
        <nav className="border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-2xl font-bold text-white">Longevity AI</span>
            </div>
            <Button onClick={() => window.location.href = getLoginUrl()}>登录</Button>
          </div>
        </nav>

        {/* 英雄区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              科学预测您的寿命
              <br />
              <span className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                延长您的生命
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              基于生物标志物和生活方式的科学寿命预测应用。每日打卡，实时调整预期寿命，获得个性化健康建议。
            </p>
            <Button size="lg" onClick={() => window.location.href = getLoginUrl()} className="text-lg px-8 py-6">
              开始使用
            </Button>
          </motion.div>

          {/* 功能卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              {
                icon: Heart,
                title: "生物年龄计算",
                description: "基于9个关键生物标志物的PhenoAge模型",
              },
              {
                icon: Calendar,
                title: "每日打卡",
                description: "记录运动、睡眠、饮食等生活方式数据",
              },
              {
                icon: TrendingUp,
                title: "实时预测",
                description: "动态调整预期寿命，查看改善潜力",
              },
              {
                icon: Zap,
                title: "AI建议",
                description: "获得基于科学研究的个性化健康建议",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardContent className="pt-6">
                    <feature.icon className="w-12 h-12 text-blue-500 mb-4" />
                    <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 导航栏 */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold text-slate-900">Longevity AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/profile")}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">个人档案</span>
            </Button>
            <span className="text-slate-600 hidden sm:inline">欢迎，{user?.name}</span>
            <Button variant="outline" onClick={logout}>
              登出
            </Button>
          </div>
        </div>
      </nav>

      {/* 标签页导航 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          {[
            { id: "overview", label: "概览", icon: Heart },
            { id: "checkin", label: "每日打卡", icon: Calendar },
            { id: "dashboard", label: "数据看板", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        {predictionLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : prediction ? (
          <>
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <LifespanCountdown
                  initialCountdown={prediction.countdown}
                  healthScore={prediction.healthScore}
                />

                {/* 快速统计 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">预期寿命</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-blue-600">
                        {prediction.estimatedLifeExpectancy.toFixed(0)}
                      </p>
                      <p className="text-sm text-slate-600 mt-2">岁</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">生物年龄</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-purple-600">
                        {prediction.biologicalAge.toFixed(1)}
                      </p>
                      <p className="text-sm text-slate-600 mt-2">
                        {prediction.biologicalAge > 35 ? "比实际年龄老" : "比实际年龄年轻"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">健康评分</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-green-600">{prediction.healthScore}</p>
                      <p className="text-sm text-slate-600 mt-2">/ 100</p>
                    </CardContent>
                  </Card>
                </div>

                {/* 改善建议 */}
                <Card>
                  <CardHeader>
                    <CardTitle>改善建议</CardTitle>
                    <CardDescription>根据您的数据，以下是可以帮助您延长寿命的建议</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="font-medium text-blue-900">💪 增加运动</p>
                        <p className="text-sm text-blue-800 mt-1">
                          每周增加150分钟的中等强度运动可以延长寿命2-3年
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-green-900">😴 改善睡眠</p>
                        <p className="text-sm text-green-800 mt-1">
                          保持7-8小时的规律睡眠可以改善健康评分
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="font-medium text-orange-900">🥗 改善饮食</p>
                        <p className="text-sm text-orange-800 mt-1">
                          增加蔬菜和全谷物的摄入，减少加工食品
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "checkin" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                <DailyCheckinForm />
              </motion.div>
            )}

            {activeTab === "dashboard" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <HealthDashboard
                  healthScore={prediction.healthScore}
                  lifestyleScore={prediction.lifestyleScore}
                  biologicalAge={prediction.biologicalAge}
                  chronologicalAge={35}
                  estimatedLifeExpectancy={prediction.estimatedLifeExpectancy}
                  remainingYears={prediction.remainingYears}
                  biomarkerAdjustment={prediction.biomarkerAdjustment}
                  lifestyleAdjustment={prediction.lifestyleAdjustment}
                />
              </motion.div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
