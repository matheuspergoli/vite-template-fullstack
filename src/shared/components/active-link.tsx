import React from "react"
import { Link, useRouterState, type LinkProps } from "@tanstack/react-router"

import { cn } from "@/libs/utils"
import { buttonVariants, type ButtonProps } from "@/shared/ui/button"

interface ActiveLinkProps extends LinkProps {
	className?: string
}

export const ActiveLink = React.forwardRef<HTMLAnchorElement, ActiveLinkProps>(
	(props, ref) => {
		const { className, to } = props

		const {
			location: { pathname }
		} = useRouterState()

		const isActive = pathname === to?.toString()
		const variant: ButtonProps["variant"] = isActive ? "default" : "ghost"

		return (
			<Link {...props} ref={ref} className={cn(buttonVariants({ variant }), className)} />
		)
	}
)
ActiveLink.displayName = "ActiveLink"
