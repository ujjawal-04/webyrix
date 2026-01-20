"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatTable = exports.frameTable = exports.projectTable = exports.usersTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.usersTable = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
    credits: (0, pg_core_1.integer)().default(2),
});
exports.projectTable = (0, pg_core_1.pgTable)('projects', {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    projectId: (0, pg_core_1.varchar)(),
    createdBy: (0, pg_core_1.varchar)().references(() => exports.usersTable.email),
    createdOn: (0, pg_core_1.timestamp)().defaultNow(),
});
exports.frameTable = (0, pg_core_1.pgTable)('frames', {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    frameId: (0, pg_core_1.varchar)(),
    designCode: (0, pg_core_1.text)(),
    projectId: (0, pg_core_1.varchar)().references(() => exports.projectTable.projectId),
    createdOn: (0, pg_core_1.timestamp)().defaultNow(),
});
exports.chatTable = (0, pg_core_1.pgTable)('chats', {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    chatMessage: (0, pg_core_1.json)(),
    frameId: (0, pg_core_1.varchar)().references(() => exports.frameTable.frameId),
    createdBy: (0, pg_core_1.varchar)().references(() => exports.usersTable.email),
    createdOn: (0, pg_core_1.timestamp)().defaultNow(),
});
