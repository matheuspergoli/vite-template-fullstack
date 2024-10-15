import { initTRPC } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import SuperJSON from "superjson"
import { ZodError } from "zod"

export const createTRPCContext = (opts: FetchCreateContextFnOptions) => {
	const source = opts.req.headers.get("x-trpc-source")
	console.log(">>> tRPC Request from", source ?? "Unknown")

	return {
		request: opts.req
	}
}

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: SuperJSON,
	errorFormatter: ({ shape, error }) => ({
		...shape,
		data: {
			...shape.data,
			zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
		}
	})
})

const timingMiddleware = t.middleware(async ({ next, path }) => {
	const start = Date.now()

	if (t._config.isDev) {
		const waitMs = Math.floor(Math.random() * 400) + 100
		await new Promise((resolve) => setTimeout(resolve, waitMs))
	}

	const result = await next()

	const end = Date.now()
	console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

	return result
})

export const publicProcedure = t.procedure.use(timingMiddleware)

export const {
	router: createTRPCRouter,
	createCallerFactory,
	middleware,
	mergeRouters
} = t
