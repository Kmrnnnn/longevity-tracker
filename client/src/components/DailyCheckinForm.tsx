import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function DailyCheckinForm() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [sleepHours, setSleepHours] = useState(7);
  const [dietQuality, setDietQuality] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [weight, setWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCheckin = trpc.health.createDailyCheckin.useMutation({
    onSuccess: () => {
      toast.success("打卡成功！");
      resetForm();
    },
    onError: (error) => {
      toast.error("打卡失败: " + error.message);
    },
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createCheckin.mutateAsync({
        checkInDate: date,
        exerciseMinutes: exerciseMinutes || undefined,
        sleepHours: sleepHours || undefined,
        dietQuality: dietQuality || undefined,
        stressLevel: stressLevel || undefined,
        weight: weight ? parseFloat(weight) : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setExerciseMinutes(0);
    setSleepHours(7);
    setDietQuality(5);
    setStressLevel(5);
    setWeight("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>每日健康打卡</CardTitle>
          <CardDescription>记录您今天的健康数据，帮助我们更准确地预测您的寿命</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 日期 */}
          <div className="space-y-2">
            <Label htmlFor="date">打卡日期</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* 运动时间 */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>运动时间</Label>
              <span className="text-sm font-medium text-muted-foreground">{exerciseMinutes} 分钟</span>
            </div>
            <Slider
              value={[exerciseMinutes]}
              onValueChange={(value) => setExerciseMinutes(value[0])}
              max={180}
              step={10}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">建议: 每周150分钟中等强度运动</p>
          </div>

          {/* 睡眠时间 */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>睡眠时间</Label>
              <span className="text-sm font-medium text-muted-foreground">{sleepHours.toFixed(1)} 小时</span>
            </div>
            <Slider
              value={[sleepHours]}
              onValueChange={(value) => setSleepHours(value[0])}
              min={4}
              max={12}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">最佳: 7-8 小时</p>
          </div>

          {/* 饮食质量 */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>饮食质量</Label>
              <span className="text-sm font-medium text-muted-foreground">{dietQuality} / 10</span>
            </div>
            <Slider
              value={[dietQuality]}
              onValueChange={(value) => setDietQuality(value[0])}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">评估今天的饮食健康程度</p>
          </div>

          {/* 压力水平 */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>压力水平</Label>
              <span className="text-sm font-medium text-muted-foreground">{stressLevel} / 10</span>
            </div>
            <Slider
              value={[stressLevel]}
              onValueChange={(value) => setStressLevel(value[0])}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">0 = 完全放松，10 = 极度压力</p>
          </div>

          {/* 体重 */}
          <div className="space-y-2">
            <Label htmlFor="weight">体重 (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="输入体重"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.1"
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "提交中..." : "提交打卡"}
            </Button>
            <Button onClick={resetForm} variant="outline">
              重置
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
