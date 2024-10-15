import { z } from "zod"

import { createTRPCRouter, publicProcedure } from "../trpc"

export const exampleRouter = createTRPCRouter({
	message: publicProcedure.input(z.object({ from: z.string() })).query(({ input }) => {
		return `Hello, from ${input.from}!`
	})
})
