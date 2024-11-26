import {
	createRootRouteWithContext,
	Outlet,
	ScrollRestoration
} from "@tanstack/react-router"

import { queryClient, trpc, trpcQueryUtils } from "@/libs/trpc"

export const Route = createRootRouteWithContext<{
	trpc: typeof trpc
	queryClient: typeof queryClient
	trpcQueryUtils: typeof trpcQueryUtils
}>()({
	component: Root
})

function Root() {
	return (
		<>
			<ScrollRestoration />
			<Outlet />
		</>
	)
}
