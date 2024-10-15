import { QueryClientProvider } from "@tanstack/react-query"

import { api, queryClient, trpcClient } from "@/libs/trpc"

export type { RouterInputs, RouterOutputs } from "@/server/root"

export const TRPCProvider = (props: { children: React.ReactNode }) => {
	return (
		<api.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
		</api.Provider>
	)
}
