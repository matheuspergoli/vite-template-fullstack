import { createRouter, ErrorComponent } from "@tanstack/react-router"

import { queryClient, trpc, trpcQueryUtils } from "./libs/trpc"
import { routeTree } from "./routeTree.gen"

export const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
	context: { trpc, queryClient, trpcQueryUtils },
	defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
	defaultPendingComponent: () => <p className="p-2 text-2xl">Loading...</p>,
	defaultNotFoundComponent: () => <p className="p-2 text-2xl">Not Found</p>
})
