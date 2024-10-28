import { createRouter, ErrorComponent } from "@tanstack/react-router"

import { api, queryClient, trpcQueryUtils } from "./libs/trpc"
import { routeTree } from "./routeTree.gen"
import { LoadingProgress } from "./shared/ui/loading-progress"

export const router = createRouter({
	routeTree,
	defaultPreload: "viewport",
	context: { api, queryClient, trpcQueryUtils },
	defaultPendingComponent: () => <LoadingProgress />,
	defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
	defaultNotFoundComponent: () => <p className="p-2 text-2xl">Not Found</p>
})
