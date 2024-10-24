import { sql } from "drizzle-orm"
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export const usersTable = sqliteTable(
	"users",
	{
		id: text("id").primaryKey(),
		username: text("username"),
		passwordHash: text("password_hash"),
		email: text("email").unique().notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`)
			.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
	},
	(table) => {
		return {
			emailIdx: uniqueIndex("user_email_idx").on(table.email),
			usernameIdx: index("user_username_idx").on(table.username)
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
