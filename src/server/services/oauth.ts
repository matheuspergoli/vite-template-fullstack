import "server-only"

import { GitHub, Google } from "arctic"

import { serverEnv } from "@/environment/server"
import { getBaseUrl } from "@/libs/utils"

export const github = new GitHub(
	serverEnv.GITHUB_CLIENT_ID,
	serverEnv.GITHUB_CLIENT_SECRET,
	null
)

export const google = new Google(
	serverEnv.GOOGLE_CLIENT_ID,
	serverEnv.GOOGLE_CLIENT_SECRET,
	`${getBaseUrl()}/api/login/google/callback`
)
