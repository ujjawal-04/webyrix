import { boolean, integer, json, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().default(2),
  role: varchar({ length: 50 }).default('owner'),
  createdOn: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
});

export const projectTable = pgTable('projects', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId: varchar().unique(),
  description: text(),
  isPublic: boolean().default(false),
  createdBy: varchar().references(() => usersTable.email),
  createdOn: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
});

export const frameTable = pgTable('frames', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  frameId: varchar().unique(),
  name: varchar({ length: 255 }),
  designCode: text(),
  projectId: varchar().references(() => projectTable.projectId),
  createdOn: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
});

export const chatTable = pgTable('chats', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  chatMessage: json(),
  frameId: varchar().references(() => frameTable.frameId),
  createdBy: varchar().references(() => usersTable.email),
  createdOn: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
});
