/**
 * 定价和订阅页面
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: plans } = trpc.payment.getAvailablePlans.useQuery();
  const { data: activeSubscription } = trpc.payment.getActiveSubscription.useQuery();
  const createCheckoutMutation = trpc.payment.createCheckoutSession.useMutation();

  const handleSubscribe = async (priceId: string) => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      return;
    }

    setIsLoading(true);
    setSelectedPlan(priceId);

    try {
      const origin = window.location.origin;
      const result = await createCheckoutMutation.mutateAsync({
        priceId,
        successUrl: `${origin}/payment-success`,
        cancelUrl: `${origin}/pricing`,
      });

      if (result.url) {
        window.open(result.url, "_blank");
        toast.success("正在跳转到支付页面...");
      }
    } catch (error) {
      toast.error("创建支付会话失败，请重试");
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const freePlanFeatures = [
    "每日健康打卡",
    "基础寿命预测",
    "生物年龄计算",
    "7天数据保留",
  ];

  const proPlanFeatures = [
    "所有免费版功能",
    "AI健康建议",
    "体检报告解析",
    "数据导出",
    "30天数据保留",
    "优先支持",
  ];

  const premiumPlanFeatures = [
    "所有专业版功能",
    "自定义报告",
    "家庭成员共享",
    "无限数据保留",
    "VIP支持（24小时响应）",
    "API访问权限",
  ];

  const isFreeTier = !activeSubscription || activeSubscription.status === "canceled";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">选择适合您的计划</h1>
          <p className="text-xl text-gray-600">
            开始您的科学长寿之旅，根据需求选择合适的订阅计划
          </p>
        </div>

        {/* 定价卡片 */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* 免费版 */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">免费版</CardTitle>
              <CardDescription>基础功能，无需支付</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">¥0</span>
                <span className="text-gray-600">/永久</span>
              </div>

              <Button
                className="w-full mb-6"
                variant={isFreeTier ? "outline" : "default"}
                disabled={isFreeTier}
              >
                {isFreeTier ? "当前计划" : "升级"}
              </Button>

              <div className="space-y-3">
                {freePlanFeatures.map((feature) => (
                  <div key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 专业版 */}
          <Card className="relative border-2 border-blue-500 shadow-lg">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg">
              <Badge className="bg-blue-600">推荐</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">专业版</CardTitle>
              <CardDescription>完整功能，适合大多数用户</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">¥99</span>
                  <span className="text-gray-600">/月</span>
                </div>
                <div className="text-sm text-gray-600">
                  或 <span className="font-semibold">¥990</span>/年（省¥198）
                </div>
              </div>

              <Button
                className="w-full mb-6 bg-blue-600 hover:bg-blue-700"
                onClick={() => handleSubscribe("price_pro_monthly")}
                disabled={isLoading && selectedPlan === "price_pro_monthly"}
              >
                {isLoading && selectedPlan === "price_pro_monthly" ? "处理中..." : "立即订阅"}
              </Button>

              <div className="space-y-3">
                {proPlanFeatures.map((feature) => (
                  <div key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 高级版 */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                高级版
              </CardTitle>
              <CardDescription>高级功能，专业用户首选</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">¥199</span>
                  <span className="text-gray-600">/月</span>
                </div>
                <div className="text-sm text-gray-600">
                  或 <span className="font-semibold">¥1990</span>/年（省¥398）
                </div>
              </div>

              <Button
                className="w-full mb-6 bg-amber-600 hover:bg-amber-700"
                onClick={() => handleSubscribe("price_premium_monthly")}
                disabled={isLoading && selectedPlan === "price_premium_monthly"}
              >
                {isLoading && selectedPlan === "price_premium_monthly" ? "处理中..." : "立即订阅"}
              </Button>

              <div className="space-y-3">
                {premiumPlanFeatures.map((feature) => (
                  <div key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ部分 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">常见问题</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">可以随时取消订阅吗？</h3>
              <p className="text-gray-600">
                是的，您可以随时取消订阅。取消后，您将在当前计费周期结束时失去高级功能访问权限。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">支持哪些支付方式？</h3>
              <p className="text-gray-600">
                我们通过Stripe支持所有主要信用卡、借记卡和其他支付方式。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">有退款政策吗？</h3>
              <p className="text-gray-600">
                如果您在订阅后7天内不满意，我们提供全额退款。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">如何升级或降级计划？</h3>
              <p className="text-gray-600">
                您可以随时在账户设置中升级或降级计划。更改将在下一个计费周期生效。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
