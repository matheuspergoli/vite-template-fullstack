import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

import { authRouter } from "./routers/auth"
import { exampleRouter } from "./routers/example"
import { userRouter } from "./routers/user"
import { createCallerFactory, createTRPCContext, createTRPCRouter } from "./trpc"

const appRouter = createTRPCRouter({
	auth: authRouter,
	user: userRouter,
	example: exampleRouter
})

const createCaller = createCallerFactory(appRouter)

export { createTRPCContext, createCaller, appRouter }

export type AppRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
