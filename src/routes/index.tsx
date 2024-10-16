import { createFileRoute } from "@tanstack/react-router"

import { api } from "@/libs/trpc"

export const Route = createFileRoute("/")({
	component: Home,
	loader: async ({ context: { trpcQueryUtils } }) => {
		await trpcQueryUtils.example.message.ensureData({ from: "the server -- Home" })
	}
})

function Home() {
	const { data } = api.example.message.useQuery({ from: "the server -- Home" })

	return (
		<main className="p-2">
			<h1>{data}</h1>
		</main>
	)
}
