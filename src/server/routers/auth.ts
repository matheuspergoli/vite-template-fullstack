import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import {
	checkPasswordLeaks,
	checkPasswordStrength,
	hashPassword,
	verifyPassword
} from "@/libs/password"

import { usersTable } from "../db/schema"
import {
	deleteSessionTokenCookie,
	invalidateUserSessions,
	setSession
} from "../services/sessions"
import { createTRPCRouter, publicProcedure } from "../trpc"
import { generateId } from "../utils/generate-id"

export const authRouter = createTRPCRouter({
	login: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().min(6).max(255)
			})
		)
		.mutation(async ({ input, ctx }) => {
			const existingUser = await ctx.db.query.usersTable.findFirst({
				where: eq(usersTable.email, input.email)
			})

			if (!existingUser || !existingUser.passwordHash) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Incorrect email or password"
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

			await invalidateUserSessions({ userId: existingUser.id })
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

			const userId = generateId()
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

			await invalidateUserSessions({ userId })
			deleteSessionTokenCookie(ctx.event)
			await setSession({ userId: user.id, event: ctx.event })
		})
})
