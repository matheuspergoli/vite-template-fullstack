import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const clientEnv = createEnv({
	client: {},
	shared: {
		BASE_URL: z.string(),
		MODE: z.string(),
		DEV: z.boolean(),
		PROD: z.boolean(),
		SSR: z.boolean()
	},
	clientPrefix: "VITE_",
	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true
})

export const serverEnv = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "production", "test"]).default("development")
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true
})
