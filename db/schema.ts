import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const households = sqliteTable('households', {
 userId:text('user_id').primaryKey(),first:text('first').notNull(),second:text('second').notNull(),
 name:text('name').notNull(),budget:integer('budget').notNull().default(0),version:integer('version').notNull().default(1),
});
export const entries = sqliteTable('entries', {
 id:text('id').primaryKey(),userId:text('user_id').notNull(),kind:text('kind').notNull(),title:text('title').notNull(),
 cents:integer('cents').notNull(),member:integer('member').notNull(),category:text('category').notNull(),date:text('date').notNull(),
 note:text('note').notNull(),createdAt:text('created_at').notNull(),version:integer('version').notNull().default(1),
},t=>[index('entries_user_idx').on(t.userId)]);
export const items=sqliteTable('items',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),kind:text('kind').notNull(),title:text('title').notNull(),
 quantity:text('quantity').notNull(),assignee:integer('assignee').notNull().default(-1),due:text('due').notNull(),
 priority:integer('priority').notNull().default(0),done:integer('done',{mode:'boolean'}).notNull().default(false),
 createdAt:text('created_at').notNull(),version:integer('version').notNull().default(1),
},t=>[index('items_user_idx').on(t.userId)]);
export const appointments=sqliteTable('appointments',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),title:text('title').notNull(),
 category:text('category').notNull(),person:integer('person').notNull(),status:text('status').notNull(),
 date:text('date').notNull(),time:text('time').notNull(),bookBy:text('book_by').notNull(),
 location:text('location').notNull(),note:text('note').notNull(),createdAt:text('created_at').notNull(),
 version:integer('version').notNull().default(1),
},t=>[index('appointments_user_idx').on(t.userId)]);
export const devices=sqliteTable('devices',{
 key:text('key').primaryKey(),userId:text('user_id').notNull(),deviceId:text('device_id').notNull(),member:integer('member').notNull(),subscription:text('subscription').notNull(),preferences:text('preferences').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[index('devices_user_idx').on(t.userId)]);
export const activity=sqliteTable('activity',{
 id:integer('id').primaryKey({autoIncrement:true}),userId:text('user_id').notNull(),actor:integer('actor').notNull(),category:text('category').notNull(),message:text('message').notNull(),createdAt:text('created_at').notNull(),
},t=>[index('activity_user_idx').on(t.userId)]);
export const calls=sqliteTable('calls',{
 userId:text('user_id').primaryKey(),id:text('id').notNull(),caller:integer('caller').notNull(),callerDevice:text('caller_device').notNull(),calleeDevice:text('callee_device').notNull().default(''),offer:text('offer').notNull(),answer:text('answer').notNull().default(''),state:text('state').notNull(),expiresAt:integer('expires_at').notNull(),createdAt:text('created_at').notNull(),
});
export const houseAccess=sqliteTable('house_access',{id:integer('id').primaryKey(),salt:text('salt').notNull(),passwordHash:text('password_hash').notNull()});
export const houseSessions=sqliteTable('house_sessions',{tokenHash:text('token_hash').primaryKey(),expiresAt:integer('expires_at').notNull()});
export const houseLoginLimits=sqliteTable('house_login_limits',{key:text('key').primaryKey(),attempts:integer('attempts').notNull(),expiresAt:integer('expires_at').notNull()});
