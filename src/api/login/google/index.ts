import { generateCodeVerifier, generateState } from "arctic"
import { defineEventHandler, setCookie } from "vinxi/http"

import { serverEnv } from "@/environment/server"
import { google } from "@/server/services/oauth"

export default defineEventHandler((event) => {
	const state = generateState()
	const codeVerifier = generateCodeVerifier()
	const url = google.createAuthorizationURL(state, codeVerifier, ["profile", "email"])

	setCookie(event, "google_oauth_state", state, {
		path: "/",
		secure: serverEnv.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	})

	setCookie(event, "google_code_verifier", codeVerifier, {
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
