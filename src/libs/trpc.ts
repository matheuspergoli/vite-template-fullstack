import { QueryClient } from "@tanstack/react-query"
import {
	createTRPCQueryUtils,
	createTRPCReact,
	httpBatchLink,
	loggerLink
} from "@trpc/react-query"
import SuperJSON from "superjson"

import { clientEnv } from "@/environment/client"
import type { AppRouter } from "@/server/root"

export const api = createTRPCReact<AppRouter>()

export const queryClient = new QueryClient()

export const trpcClient = api.createClient({
	links: [
		loggerLink({
			enabled: (opts) => {
				return (
					clientEnv.DEV || (opts.direction === "down" && opts.result instanceof Error)
				)
			},
			colorMode: "css"
		}),
		httpBatchLink({
			url: "/trpc",
			transformer: SuperJSON,
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
