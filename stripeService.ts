/**
 * Stripe 支付服务
 * 处理所有与Stripe相关的操作
 */

import Stripe from "stripe";
import { getDb } from "../db";
import { userSubscriptions, paymentHistory, subscriptionPlans } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * 创建Stripe客户
 */
export async function createStripeCustomer(userId: number, email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        userId: userId.toString(),
      },
    });

    return customer;
  } catch (error) {
    console.error("[Stripe] Failed to create customer:", error);
    throw error;
  }
}

/**
 * 创建结账会话
 */
export async function createCheckoutSession(
  userId: number,
  email: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail || email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription" as const,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: {
        userId: userId.toString(),
        customer_email: email,
      },
      client_reference_id: userId.toString(),
    });

    return session;
  } catch (error) {
    console.error("[Stripe] Failed to create checkout session:", error);
    throw error;
  }
}

/**
 * 处理订阅创建事件
 */
export async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const db = await getDb();

  if (!db) {
    console.error("[Stripe] Database not available");
    return;
  }

  try {
    const userId = parseInt(subscription.metadata?.userId || "0");
    const customerId = subscription.customer as string;
    const priceId = (subscription.items.data[0]?.price?.id || "") as string;

    if (!userId || !customerId || !priceId) {
      console.error("[Stripe] Missing required metadata for subscription");
      return;
    }

    // 保存订阅信息
    await db.insert(userSubscriptions).values({
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      planId: 0, // 将在后续更新
      status: subscription.status as any,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    });

    console.log(`[Stripe] Subscription created for user ${userId}`);
  } catch (error) {
    console.error("[Stripe] Failed to handle subscription created:", error);
  }
}

/**
 * 处理订阅更新事件
 */
export async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const db = await getDb();

  if (!db) {
    console.error("[Stripe] Database not available");
    return;
  }

  try {
    // 更新订阅状态
    await db
      .update(userSubscriptions)
      .set({
        status: subscription.status as any,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));

    console.log(`[Stripe] Subscription updated: ${subscription.id}`);
  } catch (error) {
    console.error("[Stripe] Failed to handle subscription updated:", error);
  }
}

/**
 * 处理订阅删除事件
 */
export async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const db = await getDb();

  if (!db) {
    console.error("[Stripe] Database not available");
    return;
  }

  try {
    await db
      .update(userSubscriptions)
      .set({
        status: "canceled",
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));

    console.log(`[Stripe] Subscription deleted: ${subscription.id}`);
  } catch (error) {
    console.error("[Stripe] Failed to handle subscription deleted:", error);
  }
}

/**
 * 处理支付成功事件
 */
export async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const db = await getDb();

  if (!db) {
    console.error("[Stripe] Database not available");
    return;
  }

  try {
    const userId = parseInt(paymentIntent.metadata?.userId || "0");

    if (!userId) {
      console.error("[Stripe] Missing user ID in payment metadata");
      return;
    }

    // 保存支付历史
    await db.insert(paymentHistory).values({
      userId,
      stripePaymentIntentId: paymentIntent.id,
      stripeInvoiceId: ((paymentIntent as any).invoice as string) || undefined,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: "succeeded",
      description: paymentIntent.description || undefined,
      metadata: JSON.stringify(paymentIntent.metadata),
    });

    console.log(`[Stripe] Payment succeeded for user ${userId}`);
  } catch (error) {
    console.error("[Stripe] Failed to handle payment succeeded:", error);
  }
}

/**
 * 处理支付失败事件
 */
export async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const db = await getDb();

  if (!db) {
    console.error("[Stripe] Database not available");
    return;
  }

  try {
    const userId = parseInt(paymentIntent.metadata?.userId || "0");

    if (!userId) {
      console.error("[Stripe] Missing user ID in payment metadata");
      return;
    }

    // 记录失败的支付
    await db.insert(paymentHistory).values({
      userId,
      stripePaymentIntentId: paymentIntent.id,
      stripeInvoiceId: ((paymentIntent as any).invoice as string) || undefined,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: "failed",
      description: paymentIntent.description || undefined,
      metadata: JSON.stringify(paymentIntent.metadata),
    });

    console.log(`[Stripe] Payment failed for user ${userId}`);
  } catch (error) {
    console.error("[Stripe] Failed to handle payment failed:", error);
  }
}

/**
 * 获取用户的活跃订阅
 */
export async function getUserActiveSubscription(userId: number) {
  const db = await getDb();

  if (!db) {
    console.error("[Stripe] Database not available");
    return null;
  }

  try {
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(and(eq(userSubscriptions.userId, userId), eq(userSubscriptions.status, "active")))
      .limit(1);

    return subscription[0] || null;
  } catch (error) {
    console.error("[Stripe] Failed to get user subscription:", error);
    return null;
  }
}

/**
 * 取消订阅
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return subscription;
  } catch (error) {
    console.error("[Stripe] Failed to cancel subscription:", error);
    throw error;
  }
}

/**
 * 恢复订阅
 */
export async function resumeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return subscription;
  } catch (error) {
    console.error("[Stripe] Failed to resume subscription:", error);
    throw error;
  }
}

/**
 * 获取用户的支付历史
 */
export async function getUserPaymentHistory(userId: number, limit: number = 10) {
  const db = await getDb();

  if (!db) {
    console.error("[Stripe] Database not available");
    return [];
  }

  try {
    const payments = await db
      .select()
      .from(paymentHistory)
      .where(eq(paymentHistory.userId, userId))
      .limit(limit);

    return payments;
  } catch (error) {
    console.error("[Stripe] Failed to get payment history:", error);
    return [];
  }
}
