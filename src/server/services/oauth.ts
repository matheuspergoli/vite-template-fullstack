import { GitHub } from "arctic"

import { serverEnv } from "@/environment/server"

export const github = new GitHub(
	serverEnv.GITHUB_CLIENT_ID,
	serverEnv.GITHUB_CLIENT_SECRET,
	null
)
