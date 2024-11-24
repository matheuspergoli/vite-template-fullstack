import React from "react"
import { RouterProvider } from "@tanstack/react-router"

import { ThemeProvider } from "./providers/theme-provider"
import { TRPCProvider } from "./providers/trpc-provider"
import { router } from "./router"

const InnerApp = () => {
	return <RouterProvider router={router} />
}

export const App = () => {
	return (
		<TRPCProvider>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<InnerApp />
			</ThemeProvider>
		</TRPCProvider>
	)
}
