import React from "react"
import { RouterProvider } from "@tanstack/react-router"

import { clientEnv } from "./environment/client"
import { TRPCProvider } from "./providers/trpc-provider"
import { router } from "./router"

const InnerApp = () => {
	return <RouterProvider router={router} />
}

const TanStackRouterDevtools = clientEnv.PROD
	? () => null
	: React.lazy(() =>
			import("@tanstack/router-devtools").then((res) => ({
				default: res.TanStackRouterDevtools
			}))
		)

export const App = () => {
	return (
		<TRPCProvider>
			<InnerApp />
			<React.Suspense>
				<TanStackRouterDevtools router={router} position="bottom-right" />
			</React.Suspense>
		</TRPCProvider>
	)
}
