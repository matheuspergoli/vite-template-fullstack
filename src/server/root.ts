import { authRouter } from "./routers/auth"
import { userRouter } from "./routers/user"
import { createTRPCContext, createTRPCRouter } from "./trpc"

const appRouter = createTRPCRouter({
	auth: authRouter,
	user: userRouter
})

export { createTRPCContext, appRouter }

export type AppRouter = typeof appRouter
