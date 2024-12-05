import { QueryClient } from "@tanstack/react-query"
import { httpBatchLink, loggerLink } from "@trpc/client"
import { createTRPCQueryUtils, createTRPCReact } from "@trpc/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import SuperJSON from "superjson"

import { clientEnv } from "@/environment/client"
import type { AppRouter } from "@/server/root"

export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

export const trpc = createTRPCReact<AppRouter>()

export const queryClient = new QueryClient()

export const trpcClient = trpc.createClient({
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
