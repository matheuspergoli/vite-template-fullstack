import { sha256 } from "@oslojs/crypto/sha2"
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding"
import { eq } from "drizzle-orm"
import { getCookie, setCookie, type EventHandlerRequest, type H3Event } from "vinxi/http"

import { serverEnv } from "@/environment/server"
import { createDate, isWithinExpirationDate, TimeSpan } from "@/libs/time-span"
import { db } from "@/server/db/client"
import { sessionsTable, usersTable } from "@/server/db/schema"

type Event = H3Event<EventHandlerRequest>

export type Session = typeof sessionsTable.$inferSelect

export type User = Omit<
	typeof usersTable.$inferSelect,
	"passwordHash" | "createdAt" | "updatedAt"
>

type SessionValidationResult =
	| {
			session: Session
			user: User
	  }
	| {
			session: null
			user: null
	  }

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

	const sessionDuration = new TimeSpan(30, "d") // 30 days

	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + sessionDuration.milliseconds())
	}

	await db.insert(sessionsTable).values(session)

	return session
}

export const validateSessionToken = async ({
	token
}: {
	token: string
}): Promise<SessionValidationResult> => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

	const result = await db
		.select({
			user: usersTable,
			session: sessionsTable
		})
		.from(sessionsTable)
		.innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
		.where(eq(sessionsTable.id, sessionId))
		.get()

	if (!result) {
		return { user: null, session: null }
	}

	const {
		user: {
			updatedAt: _updatedAt,
			createdAt: _createdAt,
			passwordHash: _passwordhash,
			...user
		},
		session
	} = result

	const sessionDuration = new TimeSpan(30, "d")
	const renewalThreshold = new TimeSpan(15, "d")

	if (!isWithinExpirationDate(session.expiresAt)) {
		await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))

		return { user: null, session: null }
	}

	if (Date.now() >= session.expiresAt.getTime() - renewalThreshold.milliseconds()) {
		session.expiresAt = createDate(sessionDuration)

		await db
			.update(sessionsTable)
			.set({
				expiresAt: session.expiresAt
			})
			.where(eq(sessionsTable.id, sessionId))
			.execute()
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
	event,
	token,
	expiresAt
}: {
	event: Event
	token: string
	expiresAt: Date
}) => {
	setCookie(event, "session", token, {
		httpOnly: true,
		path: "/",
		secure: serverEnv.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt
	})
}

export const deleteSessionTokenCookie = (event: Event) => {
	setCookie(event, "session", "", {
		httpOnly: true,
		path: "/",
		secure: serverEnv.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0
	})
}

export const getCurrentSession = async (event: Event) => {
	const token = getCookie(event, "session")?.valueOf() ?? null

	if (token === null) {
		return null
	}

	const { session } = await validateSessionToken({ token })

	if (!session) {
		return null
	}

	return session
}

export const getCurrentUser = async (event: Event) => {
	const token = getCookie(event, "session")?.valueOf() ?? null

	if (token === null) {
		return null
	}

	const { user } = await validateSessionToken({ token })

	if (!user) {
		return null
	}

	return user
}

export const setSession = async ({ userId, event }: { userId: string; event: Event }) => {
	const token = generateSessionToken()
	const session = await createSession({ token, userId })

	setSessionTokenCookie({ token, expiresAt: session.expiresAt, event })
}
