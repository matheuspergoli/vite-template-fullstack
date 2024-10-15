import { QueryClient } from "@tanstack/react-query"
import {
	createTRPCQueryUtils,
	createTRPCReact,
	httpBatchLink,
	loggerLink
} from "@trpc/react-query"
import SuperJSON from "superjson"

import { env } from "@/environment/env"
import type { AppRouter } from "@/server/root"

export const api = createTRPCReact<AppRouter>()

export const queryClient = new QueryClient()

export const trpcClient = api.createClient({
	links: [
		loggerLink({
			enabled: (opts) => {
				return env.DEV || (opts.direction === "down" && opts.result instanceof Error)
			},
			colorMode: "css"
		}),
		httpBatchLink({
			transformer: SuperJSON,
			url: "/trpc",
			headers() {
				const headers = new Map<string, string>()
				headers.set("x-trpc-source", "vite-react")

				return Object.fromEntries(headers)
			}
		})
	]
})

export const trpcQueryUtils = createTRPCQueryUtils({
	queryClient,
	client: trpcClient
})
