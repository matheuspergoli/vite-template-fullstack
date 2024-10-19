import {
	createRootRouteWithContext,
	Outlet,
	ScrollRestoration
} from "@tanstack/react-router"

import { createTRPCQueryUtils } from "@trpc/react-query"

import { api, queryClient } from "@/libs/trpc"
import type { AppRouter } from "@/server/root"
import { ActiveLink } from "@/shared/components/active-link"

export const Route = createRootRouteWithContext<{
	api: typeof api
	queryClient: typeof queryClient
	trpcQueryUtils: ReturnType<typeof createTRPCQueryUtils<AppRouter>>
}>()({
	component: () => {
		return (
			<>
				<nav className="flex gap-2 p-2">
					<ActiveLink to="/">Home</ActiveLink>
					<ActiveLink to="/about">About</ActiveLink>
				</nav>
				<hr />
				<ScrollRestoration />
				<Outlet />
			</>
		)
	}
})
