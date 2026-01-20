/**
 * Stripe 产品和价格配置
 * 定义所有订阅计划和产品
 */

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "免费版",
    description: "基础功能，无需支付",
    priceInCents: 0,
    currency: "cny",
    features: [
      "每日健康打卡",
      "基础寿命预测",
      "生物年龄计算",
      "7天数据保留",
    ],
    tier: "free",
  },
  PRO_MONTHLY: {
    name: "专业版 - 月度",
    description: "完整功能，月度订阅",
    priceInCents: 9900, // ¥99
    currency: "cny",
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_pro_monthly",
    features: [
      "所有免费版功能",
      "AI健康建议",
      "体检报告解析",
      "数据导出",
      "30天数据保留",
      "优先支持",
    ],
    tier: "pro",
  },
  PRO_YEARLY: {
    name: "专业版 - 年度",
    description: "完整功能，年度订阅（省¥198）",
    priceInCents: 99000, // ¥990
    currency: "cny",
    interval: "year",
    stripePriceId: process.env.STRIPE_PRICE_PRO_YEARLY || "price_pro_yearly",
    features: [
      "所有免费版功能",
      "AI健康建议",
      "体检报告解析",
      "数据导出",
      "365天数据保留",
      "优先支持",
    ],
    tier: "pro",
  },
  PREMIUM_MONTHLY: {
    name: "高级版 - 月度",
    description: "高级功能，月度订阅",
    priceInCents: 19900, // ¥199
    currency: "cny",
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "price_premium_monthly",
    features: [
      "所有专业版功能",
      "自定义报告",
      "家庭成员共享",
      "无限数据保留",
      "VIP支持（24小时响应）",
      "API访问权限",
    ],
    tier: "premium",
  },
  PREMIUM_YEARLY: {
    name: "高级版 - 年度",
    description: "高级功能，年度订阅（省¥398）",
    priceInCents: 199000, // ¥1990
    currency: "cny",
    interval: "year",
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY || "price_premium_yearly",
    features: [
      "所有专业版功能",
      "自定义报告",
      "家庭成员共享",
      "无限数据保留",
      "VIP支持（24小时响应）",
      "API访问权限",
    ],
    tier: "premium",
  },
};

/**
 * 获取订阅计划的功能列表
 */
export function getPlanFeatures(tier: "free" | "pro" | "premium"): string[] {
  const tierMap: Record<string, typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS]> = {
    free: SUBSCRIPTION_PLANS.FREE,
    pro: SUBSCRIPTION_PLANS.PRO_MONTHLY,
    premium: SUBSCRIPTION_PLANS.PREMIUM_MONTHLY,
  };

  return tierMap[tier]?.features || [];
}

/**
 * 检查用户是否有特定功能的访问权限
 */
export function hasFeatureAccess(tier: "free" | "pro" | "premium", feature: string): boolean {
  const features = getPlanFeatures(tier);
  return features.some((f) => f.includes(feature));
}

/**
 * 获取所有可用的订阅计划（不包括免费版）
 */
export function getAvailablePlans() {
  return [
    SUBSCRIPTION_PLANS.PRO_MONTHLY,
    SUBSCRIPTION_PLANS.PRO_YEARLY,
    SUBSCRIPTION_PLANS.PREMIUM_MONTHLY,
    SUBSCRIPTION_PLANS.PREMIUM_YEARLY,
  ];
}

/**
 * 根据价格ID获取计划信息
 */
export function getPlanByPriceId(priceId: string) {
  return Object.values(SUBSCRIPTION_PLANS).find(
    (plan) => "stripePriceId" in plan && plan.stripePriceId === priceId
  );
}
