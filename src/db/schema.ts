import {integer,  pgEnum, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial('id').primaryKey(),
    name: varchar('name'),
    email: text('email').unique(),
    password: text('password'),
    refreshToken: text('refresh_token')
});

export const organizations = pgTable("organizations", {
    id: serial('id').primaryKey(),
    name: varchar('name')
});

export const rolesEnum = pgEnum("roles", ["ADMIN", "MEMBER"]);

export const permissions = pgTable("permissions", {
    id: serial('id').primaryKey(),
    role: rolesEnum('role').notNull().default('MEMBER'),
    userId: integer('user_id')
        .notNull()
        .references(()=> users.id),
    organizationId: integer('organization_id')
        .notNull()
        .references(()=>organizations.id)
})

export const boards = pgTable("boards", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    organizationId: integer("organization_id")
        .notNull()
        .references(()=> organizations.id)
})

export const lists = pgTable("lists", {
    id: serial('id').primaryKey(),
    title: varchar('title').notNull(),
    rank: integer('rank').notNull(),
    boardId: integer('board_id')
        .notNull()
        .references(()=> boards.id, { onDelete: 'cascade' })
})

export const cards = pgTable("cards", {
    id: serial("id").primaryKey(),
    title: varchar('title').notNull(),
    description: text('description'),
    listId: integer('list_id').notNull()
        .references(()=> lists.id, {onDelete: 'cascade'}),
    rank: integer("rank").notNull(),
})
//relations
import { relations } from "drizzle-orm";

export const userRelations  = relations(users, ({many}) => ({
    permissions: many(permissions),
}));

export const organizationsRelations = relations(organizations, ({many}) => ({
    permissions: many(permissions),
    boards: many(boards)
}));

export const permissionsRelations = relations(permissions, ({one}) => ({
    user: one(users, {
        fields: [permissions.userId],
        references: [users.id],
    }),
    organization: one(organizations, {
        fields: [permissions.organizationId],
        references: [organizations.id],
    }),
}));

export const boardsRelations = relations(boards, ({one, many})=>({
    organization: one(organizations, {
        fields: [boards.organizationId],
        references: [organizations.id],
    }),
    lists: many(lists),
}));

export const listsRelations = relations(lists, ({one, many}) => ({
    board: one(boards, {
        fields: [lists.boardId],
        references: [boards.id],
    }),
    cards: many(cards),
}));

export const cardsRelations = relations(cards, ({one})=>({
    list: one(lists, {
        fields: [cards.listId],
        references: [lists.id]
    })
}));