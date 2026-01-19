import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { Heart, Activity, Moon, Utensils, Brain } from "lucide-react";

interface HealthDashboardProps {
  healthScore: number;
  lifestyleScore: number;
  biologicalAge: number;
  chronologicalAge: number;
  estimatedLifeExpectancy: number;
  remainingYears: number;
  biomarkerAdjustment: number;
  lifestyleAdjustment: number;
}

export function HealthDashboard({
  healthScore,
  lifestyleScore,
  biologicalAge,
  chronologicalAge,
  estimatedLifeExpectancy,
  remainingYears,
  biomarkerAdjustment,
  lifestyleAdjustment,
}: HealthDashboardProps) {
  // 模拟历史数据
  const historicalData = [
    { month: "1月", healthScore: 65, lifestyleScore: 60, biologicalAge: 42 },
    { month: "2月", healthScore: 68, lifestyleScore: 63, biologicalAge: 41.5 },
    { month: "3月", healthScore: 70, lifestyleScore: 65, biologicalAge: 41 },
    { month: "4月", healthScore: 72, lifestyleScore: 68, biologicalAge: 40.5 },
    { month: "5月", healthScore: 75, lifestyleScore: 70, biologicalAge: 40 },
    { month: "6月", healthScore: healthScore, lifestyleScore, biologicalAge },
  ];

  const adjustmentData = [
    { name: "生物标志物调整", value: biomarkerAdjustment, color: "#ef4444" },
    { name: "生活方式调整", value: lifestyleAdjustment, color: "#10b981" },
  ];

  const StatCard = ({ icon: Icon, title, value, unit, color }: any) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              <p className="text-3xl font-bold">
                {value}
                <span className="text-lg text-muted-foreground ml-1">{unit}</span>
              </p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6 w-full">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Heart}
          title="健康评分"
          value={healthScore}
          unit="/100"
          color="bg-red-500"
        />
        <StatCard
          icon={Activity}
          title="生活方式评分"
          value={lifestyleScore}
          unit="/100"
          color="bg-green-500"
        />
        <StatCard
          icon={Brain}
          title="生物年龄"
          value={biologicalAge.toFixed(1)}
          unit="岁"
          color="bg-purple-500"
        />
        <StatCard
          icon={Moon}
          title="预期寿命"
          value={estimatedLifeExpectancy.toFixed(0)}
          unit="岁"
          color="bg-blue-500"
        />
        <StatCard
          icon={Utensils}
          title="剩余寿命"
          value={remainingYears.toFixed(1)}
          unit="年"
          color="bg-orange-500"
        />
      </div>

      {/* 健康趋势图 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>6个月健康趋势</CardTitle>
            <CardDescription>健康评分、生活方式评分和生物年龄的变化</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="healthScore"
                  stroke="#ef4444"
                  name="健康评分"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="lifestyleScore"
                  stroke="#10b981"
                  name="生活方式评分"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="biologicalAge"
                  stroke="#8b5cf6"
                  name="生物年龄"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* 寿命调整分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>寿命调整分析</CardTitle>
              <CardDescription>各因素对预期寿命的影响</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={adjustmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]}>
                    {adjustmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* 年龄对比 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>生物年龄 vs 实际年龄</CardTitle>
              <CardDescription>您的生物年龄比实际年龄{biologicalAge > chronologicalAge ? "老" : "年轻"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">实际年龄</span>
                    <span className="text-sm font-bold">{chronologicalAge} 岁</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${(chronologicalAge / 100) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">生物年龄</span>
                    <span className="text-sm font-bold">{biologicalAge.toFixed(1)} 岁</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${biologicalAge > chronologicalAge ? "bg-red-500" : "bg-green-500"}`}
                      style={{ width: `${(biologicalAge / 100) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {biologicalAge > chronologicalAge
                      ? `您的生物年龄比实际年龄老 ${(biologicalAge - chronologicalAge).toFixed(1)} 岁。通过改善生活方式可以减缓衰老。`
                      : `很好！您的生物年龄比实际年龄年轻 ${(chronologicalAge - biologicalAge).toFixed(1)} 岁。继续保持健康的生活方式！`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
