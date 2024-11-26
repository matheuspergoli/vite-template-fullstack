import { sha256 } from "@oslojs/crypto/sha2"
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding"
import { eq } from "drizzle-orm"
import { getCookie, setCookie } from "vinxi/http"

import { serverEnv } from "@/environment/server"
import { createDate, isWithinExpirationDate, TimeSpan } from "@/libs/time-span"
import { db } from "@/server/db/client"
import {
	sessionsTable,
	usersTable,
	type SessionSelect,
	type UserSelect
} from "@/server/db/schema"

export type Session = SessionSelect
export type User = Omit<UserSelect, "passwordHash">

type SessionValidationResult =
	| {
			session: Session
			user: User
	  }
	| {
			session: undefined
			user: undefined
	  }

const SESSION_DURATION = new TimeSpan(30, "d")
const RENEWAL_THRESHOLD = new TimeSpan(15, "d")

export const generateSessionToken = () => {
	const tokenBytes = new Uint8Array(20)
	crypto.getRandomValues(tokenBytes)
	const token = encodeBase32LowerCaseNoPadding(tokenBytes)
	return token
}

export const createSession = async ({
	token,
	userId
}: {
	token: string
	userId: string
}): Promise<Session> => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + SESSION_DURATION.milliseconds())
	}

	await db.transaction(async (tx) => {
		await tx.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
		await tx.insert(sessionsTable).values(session)
	})

	return session
}

export const validateSessionToken = async ({
	token
}: {
	token: string
}): Promise<SessionValidationResult> => {
	if (!token) {
		return { user: undefined, session: undefined }
	}

	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

	const result = await db
		.select({
			session: sessionsTable,
			user: {
				id: usersTable.id,
				email: usersTable.email,
				createdAt: usersTable.createdAt,
				updatedAt: usersTable.updatedAt
			}
		})
		.from(sessionsTable)
		.leftJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
		.where(eq(sessionsTable.id, sessionId))
		.get()

	if (!result?.session || !result.user) {
		await invalidateSession({ sessionId })
		return { user: undefined, session: undefined }
	}

	const { session, user } = result

	if (!isWithinExpirationDate(result.session.expiresAt)) {
		await invalidateSession({ sessionId })
		return { user: undefined, session: undefined }
	}

	if (Date.now() >= session.expiresAt.getTime() - RENEWAL_THRESHOLD.milliseconds()) {
		const newExpiresAt = createDate(SESSION_DURATION)

		await db
			.update(sessionsTable)
			.set({ expiresAt: newExpiresAt })
			.where(eq(sessionsTable.id, sessionId))
			.execute()

		session.expiresAt = newExpiresAt
	}

	return { user, session }
}

export const invalidateSession = async ({ sessionId }: { sessionId: string }) => {
	await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
}

export const invalidateUserSessions = async ({ userId }: { userId: string }) => {
	await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId))
}

export const setSessionTokenCookie = ({
	token,
	expiresAt
}: {
	token: string
	expiresAt: Date
}) => {
	setCookie("session", token, {
		httpOnly: true,
		path: "/",
		secure: serverEnv.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt
	})
}

export const deleteSessionTokenCookie = () => {
	setCookie("session", "", {
		httpOnly: true,
		path: "/",
		secure: serverEnv.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0
	})
}

export const getCurrentSession = async () => {
	const token = getCookie("session")?.valueOf()

	if (!token) {
		return undefined
	}

	const { session } = await validateSessionToken({ token })

	if (!session) {
		deleteSessionTokenCookie()
		return undefined
	}

	return session
}

export const getCurrentUser = async () => {
	const token = getCookie("session")?.valueOf()

	if (!token) {
		return undefined
	}

	const { user } = await validateSessionToken({ token })

	if (!user) {
		deleteSessionTokenCookie()
		return undefined
	}

	return user
}

export const setSession = async ({ userId }: { userId: string }) => {
	await invalidateUserSessions({ userId })
	deleteSessionTokenCookie()

	const token = generateSessionToken()
	const session = await createSession({ token, userId })

	if (!session) {
		throw new Error("Failed to create session")
	}

	setSessionTokenCookie({ token, expiresAt: session.expiresAt })
}
