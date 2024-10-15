import { RouterProvider } from "@tanstack/react-router"

import { TRPCProvider } from "./providers/trpc-provider"
import { router } from "./router"

const InnerApp = () => {
	return <RouterProvider router={router} />
}

export const App = () => {
	return (
		<TRPCProvider>
			<InnerApp />
		</TRPCProvider>
	)
}
