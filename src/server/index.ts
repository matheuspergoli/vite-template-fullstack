import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { defineEventHandler, getRequestIP, getWebRequest } from "vinxi/http"

import { appRouter, createTRPCContext } from "./root"

export default defineEventHandler(() => {
	const request = getWebRequest()
	const clientIP = getRequestIP()

	return fetchRequestHandler({
		endpoint: "/trpc",
		req: request,
		router: appRouter,
		createContext: (opts) => createTRPCContext({ ...opts, clientIP }),
		onError: (opts) => {
			console.log("TRPC Error", {
				data: opts.error.name,
				code: opts.error.code,
				message: opts.error.message
			})
		}
	})
})
