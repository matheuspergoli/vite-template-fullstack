import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { createApp } from "vinxi"
import tsconfigPaths from "vite-tsconfig-paths"

export default createApp({
	routers: [
		{
			name: "public",
			type: "static",
			dir: "./public"
		},
		{
			name: "client",
			type: "spa",
			handler: "./index.html",
			target: "browser",
			base: "/",
			plugins: () => [
				TanStackRouterVite({
					quoteStyle: "double",
					autoCodeSplitting: true,
					routesDirectory: "./src/routes",
					generatedRouteTree: "./src/routeTree.gen.ts"
				}),
				react(),
				tsconfigPaths()
			]
		},
		{
			name: "server",
			type: "http",
			target: "server",
			handler: "./src/server/index.ts",
			base: "/trpc",
			plugins: () => [react(), tsconfigPaths()]
		}
	]
})
