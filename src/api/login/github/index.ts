import { generateState } from "arctic"
import { defineEventHandler, setCookie } from "vinxi/http"

import { serverEnv } from "@/environment/server"
import { github } from "@/server/auth/oauth"

export default defineEventHandler(() => {
	const state = generateState()
	const url = github.createAuthorizationURL(state, ["user:email"])

	setCookie("github_oauth_state", state, {
		path: "/",
		secure: serverEnv.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	})

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.href
		}
	})
})
