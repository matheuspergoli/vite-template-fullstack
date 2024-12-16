import { createRouter } from "@tanstack/react-router"

import { queryClient, trpcQueryUtils } from "./libs/trpc"
import { routeTree } from "./routeTree.gen"
import { DefaultCatchBoundary } from "./shared/components/default-catch-boundary"
import { DefaultNotFound } from "./shared/components/default-not-found"

export const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
	context: { queryClient, trpcQueryUtils },
	defaultNotFoundComponent: () => <DefaultNotFound />,
	defaultErrorComponent: (error) => <DefaultCatchBoundary {...error} />,
	defaultPendingComponent: () => <p className="p-2 text-2xl">Loading...</p>
})
