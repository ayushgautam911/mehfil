import { pgTable, uuid, varchar, integer, timestamp, uniqueIndex, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 20 }),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }), // null for members
  role: varchar('role', { length: 20 }).default('member').notNull(), // 'admin' | 'member'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const collectives = pgTable('collectives', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  handle: varchar('handle', { length: 100 }).unique().notNull(),
  location: varchar('location', { length: 100 }).notNull(),
  founded: varchar('founded', { length: 4 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const memberships = pgTable('memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  collectiveId: uuid('collective_id').references(() => collectives.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).default('member').notNull(), // 'admin' | 'member'
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active' | 'blocked'
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userColUnique: uniqueIndex('idx_user_collective').on(table.userId, table.collectiveId),
  };
});

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  collectiveId: uuid('collective_id').references(() => collectives.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  date: varchar('date', { length: 100 }).notNull(),
  time: varchar('time', { length: 50 }).notNull(), // doors / start time
  endTime: varchar('end_time', { length: 50 }), // when the event wraps — optional
  venue: varchar('venue', { length: 150 }).notNull(), // venue name (public)
  venueAddress: varchar('venue_address', { length: 300 }), // street address — hidden until reveal, optional
  status: varchar('status', { length: 20 }).default('draft').notNull(), // 'published' | 'draft'
  capacity: integer('capacity').notNull(),
  passesIssued: integer('passes_issued').default(0).notNull(),
  description: text('description'), // long-form, optional
  imageUrl: text('image_url'), // public GCS URL of the event flyer/cover — optional
  addressRevealAt: timestamp('address_reveal_at', { withTimezone: true }), // exact moment the address is revealed
  lineup: text('lineup').array(), // ordered list of artist names
  genres: text('genres').array(), // filterable list of genres
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const passes = pgTable('passes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 20 }).default('issued').notNull(), // 'issued' | 'used' | 'cancelled'
  qrToken: varchar('qr_token', { length: 64 }).unique().notNull(),
  qrSignature: varchar('qr_signature', { length: 128 }).notNull(),
  issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userEventUnique: uniqueIndex('idx_user_event_active').on(table.userId, table.eventId),
  };
});

export const templates = pgTable('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  collectiveId: uuid('collective_id').references(() => collectives.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

