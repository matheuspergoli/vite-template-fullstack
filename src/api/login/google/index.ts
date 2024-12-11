import { generateCodeVerifier, generateState } from "arctic"
import { defineEventHandler, setCookie } from "vinxi/http"

import { serverEnv } from "@/environment/server"
import { google } from "@/server/auth/oauth"

export default defineEventHandler(() => {
	const state = generateState()
	const codeVerifier = generateCodeVerifier()
	const url = google.createAuthorizationURL(state, codeVerifier, ["profile", "email"])

	setCookie("google_oauth_state", state, {
		path: "/",
		secure: serverEnv.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	})

	setCookie("google_code_verifier", codeVerifier, {
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
