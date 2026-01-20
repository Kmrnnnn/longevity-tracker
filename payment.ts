/**
 * 支付相关的tRPC路由
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createCheckoutSession,
  getUserActiveSubscription,
  cancelSubscription,
  resumeSubscription,
  getUserPaymentHistory,
} from "../stripe/stripeService";
import { getAvailablePlans } from "../stripe/products";

// 注意：这里的cancelSubscription和resumeSubscription是从stripeService导入的
// 不要与payment router中的同名方法混淆

export const paymentRouter = router({
  /**
   * 获取可用的订阅计划
   */
  getAvailablePlans: protectedProcedure.query(() => {
    return getAvailablePlans();
  }),

  /**
   * 创建支付结账会话
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
        successUrl: z.string(),
        cancelUrl: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return createCheckoutSession(
        ctx.user.id,
        ctx.user.email || "",
        input.priceId,
        input.successUrl,
        input.cancelUrl,
        ctx.user.email || undefined
      )
        .then((session) => ({
          sessionId: session.id,
          url: session.url,
        }))
        .catch((error) => {
          console.error("[Payment] Failed to create checkout session:", error);
          throw new Error("Failed to create checkout session");
        });
    }),

  /**
   * 获取用户的活跃订阅
   */
  getActiveSubscription: protectedProcedure.query(({ ctx }) => {
    return getUserActiveSubscription(ctx.user.id);
  }),

  /**
   * 取消订阅
   */
  cancelSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(({ input }) => {
      return cancelSubscription(input.subscriptionId)
        .then((subscription) => ({
          success: true,
          subscription,
        }))
        .catch((error) => {
          console.error("[Payment] Failed to cancel subscription:", error);
          throw new Error("Failed to cancel subscription");
        });
    }),

  /**
   * 恢复订阅
   */
  resumeSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(({ input }) => {
      return resumeSubscription(input.subscriptionId)
        .then((subscription) => ({
          success: true,
          subscription,
        }))
        .catch((error) => {
          console.error("[Payment] Failed to resume subscription:", error);
          throw new Error("Failed to resume subscription");
        });
    }),

  /**
   * 获取支付历史
   */
  getPaymentHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(({ ctx, input }) => {
      return getUserPaymentHistory(ctx.user.id, input.limit || 10);
    }),
});
