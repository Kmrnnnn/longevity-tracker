/**
 * 支付成功页面
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // 3秒后自动跳转到仪表板
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">支付成功！</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-gray-600 mb-2">感谢您的订阅</p>
            <p className="text-sm text-gray-500">
              您的订阅已激活，现在可以享受所有高级功能
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">订阅确认邮件</span>已发送到您的邮箱，请检查收件箱
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">将在3秒后自动跳转到仪表板</p>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/")}
            >
              立即返回仪表板
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
