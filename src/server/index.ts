import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { defineEventHandler, toWebRequest } from "vinxi/http"

import { appRouter, createTRPCContext } from "./root"

export default defineEventHandler((event) => {
	const request = toWebRequest(event)

	return fetchRequestHandler({
		endpoint: "/trpc",
		req: request,
		router: appRouter,
		createContext: createTRPCContext,
		onError: (opts) => {
			console.log("TRPC Error", {
				data: opts.error.name,
				code: opts.error.code,
				message: opts.error.message
			})
		}
	})
})
