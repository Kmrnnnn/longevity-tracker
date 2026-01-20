/**
 * Stripe Webhook 处理器
 * 处理Stripe发送的所有webhook事件
 */

import Stripe from "stripe";
import { Request, Response } from "express";
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
} from "./stripeService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * 验证Webhook签名并处理事件
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header");
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  try {
    // 验证webhook签名
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (error) {
    console.error("[Webhook] Signature verification failed:", error);
    return res.status(400).json({ error: "Signature verification failed" });
  }

  // 处理测试事件
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  try {
    // 根据事件类型处理
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event);
        break;

      case "charge.refunded":
        console.log("[Webhook] Charge refunded:", event.data.object);
        break;

      case "invoice.paid":
        console.log("[Webhook] Invoice paid:", event.data.object);
        break;

      case "invoice.payment_failed":
        console.log("[Webhook] Invoice payment failed:", event.data.object);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // 返回成功响应
    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
