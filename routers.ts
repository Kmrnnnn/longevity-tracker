import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { healthRouter } from "./routers/health";
import { paymentRouter } from "./routers/payment";

// 注意：cancelSubscription和resumeSubscription函数名称与payment router中的方法名称相同
// 但它们是不同的函数（一个是Stripe服务函数，一个是tRPC路由方法）

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  health: healthRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;

// 注意：Stripe Webhook处理需要在server/_core/index.ts中单独注册
// 使用express.raw()中间件来处理原始请求体
