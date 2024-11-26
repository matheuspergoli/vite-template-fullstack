import { QueryClientProvider } from "@tanstack/react-query"

import { queryClient, trpc, trpcClient } from "@/libs/trpc"

export const TRPCProvider = (props: { children: React.ReactNode }) => {
	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
		</trpc.Provider>
	)
}
