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
		},
		{
			name: "github-login",
			type: "http",
			target: "server",
			handler: "./src/api/login/github/index.ts",
			base: "/api/login/github",
			plugins: () => [react(), tsconfigPaths()]
		},
		{
			name: "github-callback",
			type: "http",
			target: "server",
			handler: "./src/api/login/github/callback.ts",
			base: "/api/login/github/callback",
			plugins: () => [react(), tsconfigPaths()]
		},
		{
			name: "google-login",
			type: "http",
			target: "server",
			handler: "./src/api/login/google/index.ts",
			base: "/api/login/google",
			plugins: () => [react(), tsconfigPaths()]
		},
		{
			name: "google-callback",
			type: "http",
			target: "server",
			handler: "./src/api/login/google/callback.ts",
			base: "/api/login/google/callback",
			plugins: () => [react(), tsconfigPaths()]
		}
	]
})
