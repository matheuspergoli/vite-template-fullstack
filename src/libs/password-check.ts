import { sha1 } from "@oslojs/crypto/sha1"
import { encodeHexLowerCase } from "@oslojs/encoding"
import zxcvbn from "zxcvbn"

export const checkPasswordStrength = (password: string) => {
	const checkPasswordStrength = zxcvbn(password)

	return checkPasswordStrength
}

export const checkPasswordLeaks = async (password: string) => {
	const hash = encodeHexLowerCase(sha1(new TextEncoder().encode(password)))
	const hashPrefix = hash.slice(0, 5)

	const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`)

	if (response.ok) {
		const body = await response.text()
		const lines = body.split("\n")
		const hashSuffix = hash.slice(5).toUpperCase()

		for (const line of lines) {
			const [suffix] = line.split(":")
			if (suffix === hashSuffix) {
				return true
			}
		}

		return false
	}

	return false
}
