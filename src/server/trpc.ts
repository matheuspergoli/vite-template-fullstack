import { initTRPC, TRPCError } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import SuperJSON from "superjson"
import { getCookie, setCookie, type EventHandlerRequest, type H3Event } from "vinxi/http"
import { ZodError } from "zod"

import { serverEnv } from "@/environment/server"
import { TimeSpan } from "@/libs/time-span"

import { db } from "./db/client"
import { getCurrentSession, getCurrentUser } from "./services/sessions"

interface ContextOptions extends FetchCreateContextFnOptions {
	clientIP: string | undefined
	event: H3Event<EventHandlerRequest>
}

export const createTRPCContext = (opts: ContextOptions) => {
	const source = opts.req.headers.get("x-trpc-source")
	console.log(">>> tRPC Request from", source ?? "Unknown")

	return {
		db,
		event: opts.event,
		request: opts.req,
		clientIP: opts.clientIP
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

const csrfProtectionMiddleware = t.middleware(async ({ next, ctx }) => {
	const { event, request } = ctx

	if (request.method === "GET") {
		const maxAge = new TimeSpan(30, "d")
		const token = getCookie(event, "session")

		if (token) {
			setCookie(event, "session", token, {
				path: "/",
				maxAge: maxAge.seconds(),
				sameSite: "lax",
				httpOnly: true,
				secure: serverEnv.NODE_ENV === "production"
			})
		}

		return next()
	}

	const originHeader = request.headers.get("Origin")
	const hostHeader = request.headers.get("Host")

	if (originHeader === null || hostHeader === null) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Origin or Host header missing"
		})
	}

	const origin = new URL(originHeader)

	if (origin.host !== hostHeader) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Origin and Host header mismatch"
		})
	}

	return next()
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

export const publicProcedure = t.procedure
	.use(timingMiddleware)
	.use(csrfProtectionMiddleware)

export const authedProcedure = publicProcedure.use(async ({ ctx, next }) => {
	if (!ctx.clientIP) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Client IP missing"
		})
	}

	const user = await getCurrentUser(ctx.event)
	const session = await getCurrentSession(ctx.event)

	if (!user?.id || !session?.userId) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Not logged in"
		})
	}

	return next({
		ctx: {
			user,
			session,
			clientIP: ctx.clientIP
		}
	})
})

export const {
	router: createTRPCRouter,
	createCallerFactory,
	middleware,
	mergeRouters
} = t
