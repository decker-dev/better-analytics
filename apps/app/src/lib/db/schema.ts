import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  site: text('site').notNull(),
  ts: integer('ts').notNull(),
  evt: text('evt').notNull(),
  url: text('url'),
  ref: text('ref'),
  props: text('props'),
});

// Zod schemas for validation
export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);

// TypeScript types
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert; 