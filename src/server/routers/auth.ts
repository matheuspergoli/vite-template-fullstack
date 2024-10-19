import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import {
	checkPasswordLeaks,
	checkPasswordStrength,
	hashPassword,
	verifyPassword
} from "@/libs/password"
import { ExpiringTokenBucket, Throttler } from "@/libs/rate-limit"
import { generateRandomId } from "@/libs/utils"

import { usersTable } from "../db/schema"
import {
	deleteSessionTokenCookie,
	getCurrentSession,
	getCurrentUser,
	invalidateSession,
	setSession
} from "../services/auth"
import {
	createTRPCRouter,
	globalMutationRateLimitMiddleware,
	publicProcedure
} from "../trpc"

const throttler = new Throttler<string>([20, 35, 60, 120, 180, 240, 360, 480, 660])
const ipBucket = new ExpiringTokenBucket<string>(5, 60 * 60)

export const authRouter = createTRPCRouter({
	getCurrentUser: publicProcedure.query(async ({ ctx }) => {
		const user = await getCurrentUser(ctx.event)
		return user
	}),
	getCurrentSession: publicProcedure.query(async ({ ctx }) => {
		const session = await getCurrentSession(ctx.event)
		return session
	}),
	logout: publicProcedure.mutation(async ({ ctx }) => {
		const session = await getCurrentSession(ctx.event)

		if (!session) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "You are not logged in"
			})
		}

		await invalidateSession({ sessionId: session.id })
		deleteSessionTokenCookie(ctx.event)
	}),
	login: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().min(6).max(255)
			})
		)
		.use(globalMutationRateLimitMiddleware)
		.use(async ({ ctx, next }) => {
			if (!throttler.consume(ctx.clientIP)) {
				throw new TRPCError({
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests"
				})
			}

			return next()
		})
		.mutation(async ({ input, ctx }) => {
			const existingUser = await ctx.db.query.usersTable.findFirst({
				where: eq(usersTable.email, input.email)
			})

			if (!existingUser || !existingUser.passwordHash) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Incorrect email or password"
				})
			}

			if (!throttler.consume(existingUser.id)) {
				throw new TRPCError({
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests"
				})
			}

			const validPassword = await verifyPassword(
				input.password,
				existingUser.passwordHash
			)

			if (!validPassword) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Incorrect email or password"
				})
			}

			throttler.reset(existingUser.id)

			deleteSessionTokenCookie(ctx.event)
			await setSession({ userId: existingUser.id, event: ctx.event })
		}),
	signup: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().min(6).max(255)
			})
		)
		.use(globalMutationRateLimitMiddleware)
		.use(async ({ ctx, next }) => {
			if (!ipBucket.check(ctx.clientIP, 1)) {
				throw new TRPCError({
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests"
				})
			}

			return next()
		})
		.mutation(async ({ input, ctx }) => {
			const existingUser = await ctx.db.query.usersTable.findFirst({
				where: eq(usersTable.email, input.email)
			})

			if (existingUser) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Signup failed. Check your credentials or try another email address."
				})
			}

			const { feedback } = checkPasswordStrength(input.password)

			if (feedback.warning) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: feedback.warning
				})
			}

			const checkForPasswordLeaks = await checkPasswordLeaks(input.password)

			if (checkForPasswordLeaks) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "This password has been leaked in a data breach"
				})
			}

			const userId = generateRandomId()
			const hashedPassword = await hashPassword(input.password)

			const user = await ctx.db
				.insert(usersTable)
				.values({
					id: userId,
					email: input.email,
					passwordHash: hashedPassword
				})
				.returning()
				.then((res) => res[0] ?? null)

			if (!user) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create user"
				})
			}

			if (!ipBucket.consume(ctx.clientIP, 1)) {
				throw new TRPCError({
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests"
				})
			}

			deleteSessionTokenCookie(ctx.event)
			await setSession({ userId: user.id, event: ctx.event })
		})
})
