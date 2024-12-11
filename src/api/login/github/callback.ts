import { OAuth2RequestError } from "arctic"
import { eq } from "drizzle-orm"
import { defineEventHandler, getCookie, getWebRequest } from "vinxi/http"
import { z } from "zod"

import { github } from "@/server/auth/oauth"
import { setSession } from "@/server/auth/sessions"
import { db } from "@/server/db/client"
import { oauthAccountsTable, usersTable } from "@/server/db/schema"

const GithubUser = z.object({
	id: z.number(),
	email: z.string().email()
})

export default defineEventHandler(async () => {
	const request = getWebRequest()

	const url = new URL(request.url)
	const code = url.searchParams.get("code")
	const state = url.searchParams.get("state")
	const storedState = getCookie("github_oauth_state")

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		})
	}

	try {
		const oauthUrl = "https://api.github.com/user"
		const tokens = await github.validateAuthorizationCode(code)
		const githubUserResponse = await fetch(oauthUrl, {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`
			}
		})

		const githubUserUnparsed = await githubUserResponse.json()
		const githubUserParsed = GithubUser.safeParse(githubUserUnparsed)

		if (!githubUserParsed.success) {
			return new Response(null, {
				status: 400,
				statusText: "Bad Request"
			})
		}

		const githubUser = githubUserParsed.data

		const existingGithubUser = await db
			.select({
				id: usersTable.id,
				email: usersTable.email
			})
			.from(usersTable)
			.innerJoin(oauthAccountsTable, eq(usersTable.id, oauthAccountsTable.userId))
			.where(eq(oauthAccountsTable.providerUserId, githubUser.id.toString()))
			.limit(1)
			.then((res) => res[0] ?? null)

		if (existingGithubUser) {
			await setSession({ userId: existingGithubUser.id })
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/"
				}
			})
		}

		const newGithubUser = await db
			.insert(usersTable)
			.values({
				email: githubUser.email
			})
			.returning()
			.then((res) => res[0] ?? null)

		if (!newGithubUser) {
			return new Response(null, {
				status: 500,
				statusText: "Error creating github user"
			})
		}

		const newOauthAccount = await db
			.insert(oauthAccountsTable)
			.values({
				providerId: "github",
				providerUserId: githubUser.id.toString(),
				userId: newGithubUser.id
			})
			.returning()
			.then((res) => res[0] ?? null)

		if (!newOauthAccount) {
			return new Response(null, {
				status: 500,
				statusText: "Error creating github oauth account"
			})
		}

		await setSession({ userId: newGithubUser.id })

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		})
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			return new Response(null, {
				status: 400
			})
		}

		return new Response(null, {
			status: 500
		})
	}
})
