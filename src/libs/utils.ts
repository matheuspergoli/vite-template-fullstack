import { encodeBase32 } from "@oslojs/encoding"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs))
}

export const generateRandomId = () => {
	const idBytes = new Uint8Array(20)
	crypto.getRandomValues(idBytes)
	const id = encodeBase32(idBytes).toLowerCase()
	return id
}
