import {
	createRootRouteWithContext,
	Outlet,
	ScrollRestoration
} from "@tanstack/react-router"

import { createTRPCQueryUtils } from "@trpc/react-query"

import { api, queryClient } from "@/libs/trpc"
import type { AppRouter } from "@/server/root"

export const Route = createRootRouteWithContext<{
	api: typeof api
	queryClient: typeof queryClient
	trpcQueryUtils: ReturnType<typeof createTRPCQueryUtils<AppRouter>>
}>()({
	component: () => {
		return (
			<>
				<ScrollRestoration />
				<Outlet />
			</>
		)
	}
})
