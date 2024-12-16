import {
	createRootRouteWithContext,
	Outlet,
	ScrollRestoration
} from "@tanstack/react-router"

import { queryClient, trpcQueryUtils } from "@/libs/trpc"

export const Route = createRootRouteWithContext<{
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
