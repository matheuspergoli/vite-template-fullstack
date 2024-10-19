import { defineConfig } from "drizzle-kit"

import { serverEnv } from "./src/environment/server"

export default defineConfig({
	schema: "./src/server/db/schema.ts",
	out: "./migrations",
	dialect: "sqlite",
	dbCredentials: {
		url: serverEnv.DATABASE_URL
	}
})
