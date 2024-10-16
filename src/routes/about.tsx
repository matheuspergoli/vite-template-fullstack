import { createFileRoute } from "@tanstack/react-router"

import { api } from "@/libs/trpc"

export const Route = createFileRoute("/about")({
	component: About,
	loader: async ({ context: { trpcQueryUtils } }) => {
		await trpcQueryUtils.example.message.ensureData({ from: "the server -- About" })
	}
})

function About() {
	const { data } = api.example.message.useQuery({ from: "the server -- About" })

	return (
		<main className="p-2">
			<h1>{data}</h1>
		</main>
	)
}
