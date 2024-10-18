import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const serverEnv = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "production", "test"])
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true
})
