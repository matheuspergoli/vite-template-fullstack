import { authRouter } from "./routers/auth"
import { userRouter } from "./routers/user"
import { createCallerFactory, createTRPCContext, createTRPCRouter } from "./trpc"

const appRouter = createTRPCRouter({
	auth: authRouter,
	user: userRouter
})

const createCaller = createCallerFactory(appRouter)

export { createTRPCContext, createCaller, appRouter }

export type AppRouter = typeof appRouter
