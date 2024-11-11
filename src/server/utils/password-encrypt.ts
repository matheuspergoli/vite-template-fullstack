import { hash, verify } from "@node-rs/argon2"

export const hashPassword = async (password: string) => {
	return await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	})
}

export const verifyPassword = async (password: string, hash: string) => {
	return await verify(hash, password)
}
