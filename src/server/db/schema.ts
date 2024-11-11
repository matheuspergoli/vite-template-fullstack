import {
	customType,
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex
} from "drizzle-orm/sqlite-core"

import { generateId } from "../utils/generate-id"

export type OauthProviderIds = "github" | "google"

const oauthProviderIds = customType<{ data: OauthProviderIds }>({
	dataType() {
		return "github"
	}
})

export const usersTable = sqliteTable(
	"users",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => generateId()),
		passwordHash: text("password_hash"),
		email: text("email").unique().notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date())
	},
	(table) => {
		return {
			emailIdx: uniqueIndex("user_email_idx").on(table.email)
		}
	}
)

export const oauthAccountsTable = sqliteTable(
	"oauth_accounts",
	{
		providerUserId: text("provider_user_id").notNull(),
		providerId: oauthProviderIds("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date())
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.providerId, table.providerUserId] }),
			providerUserIdIdx: index("oauth_account_provider_user_id_idx").on(
				table.providerUserId
			),
			userIdIdx: index("oauth_account_user_id_idx").on(table.userId)
		}
	}
)

export const sessionsTable = sqliteTable(
	"sessions",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull()
	},
	(table) => {
		return {
			userIdIdx: index("session_user_id_idx").on(table.userId),
			expiresAtIdx: index("session_expires_at_idx").on(table.expiresAt)
		}
	}
)

export type UserSelect = typeof usersTable.$inferSelect
export type UserInsert = typeof usersTable.$inferInsert

export type SessionSelect = typeof sessionsTable.$inferSelect
export type SessionInsert = typeof sessionsTable.$inferInsert

export type OauthAccountSelect = typeof oauthAccountsTable.$inferSelect
export type OauthAccountInsert = typeof oauthAccountsTable.$inferInsert
