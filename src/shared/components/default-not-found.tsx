import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import { Button } from "../ui/button"

export const DefaultNotFound = ({ children }: { children?: ReactNode }) => {
	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center gap-3">
			<div className="text-gray-600 dark:text-gray-400">
				{children ?? <p>The page you are looking for does not exist.</p>}
			</div>
			<p className="flex flex-wrap items-center gap-2">
				<Button onClick={() => window.history.back()}>Go back</Button>
				<Button asChild>
					<Link to="/">Start Over</Link>
				</Button>
			</p>
		</div>
	)
}