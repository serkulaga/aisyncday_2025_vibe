/**
 * Transform utilities between database types (snake_case) and app types (camelCase)
 */

import type { DatabaseParticipant } from "@/types/database";
import type { Participant } from "@/types";

/**
 * Convert database participant (snake_case) to app participant (camelCase)
 */
export function dbParticipantToApp(
  db: DatabaseParticipant
): Participant {
  return {
    id: db.id,
    name: db.name,
    email: db.email,
    telegram: db.telegram,
    linkedin: db.linkedin,
    photo: db.photo,
    bio: db.bio,
    skills: db.skills,
    hasStartup: db.has_startup,
    startupStage: db.startup_stage,
    startupDescription: db.startup_description,
    startupName: db.startup_name,
    lookingFor: db.looking_for,
    canHelp: db.can_help,
    needsHelp: db.needs_help,
    aiUsage: db.ai_usage,
    custom_1: db.custom_1,
    custom_2: db.custom_2,
    custom_3: db.custom_3,
    custom_4: db.custom_4,
    custom_5: db.custom_5,
    custom_6: db.custom_6,
    custom_7: db.custom_7,
    custom_array_1: db.custom_array_1,
    custom_array_2: db.custom_array_2,
    custom_array_3: db.custom_array_3,
    custom_array_4: db.custom_array_4,
    custom_array_5: db.custom_array_5,
    custom_array_6: db.custom_array_6,
    custom_array_7: db.custom_array_7,
    _note: db._note || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    embedding: db.embedding,
  };
}

/**
 * Convert app participant (camelCase) to database participant (snake_case)
 * Useful for inserts/updates
 */
export function appParticipantToDb(
  app: Partial<Participant>
): Partial<DatabaseParticipant> {
  const db: Partial<DatabaseParticipant> = {};

  if (app.id !== undefined) db.id = app.id;
  if (app.name !== undefined) db.name = app.name;
  if (app.email !== undefined) db.email = app.email;
  if (app.telegram !== undefined) db.telegram = app.telegram;
  if (app.linkedin !== undefined) db.linkedin = app.linkedin;
  if (app.photo !== undefined) db.photo = app.photo;
  if (app.bio !== undefined) db.bio = app.bio;
  if (app.skills !== undefined) db.skills = app.skills;
  if (app.hasStartup !== undefined) db.has_startup = app.hasStartup;
  if (app.startupStage !== undefined) db.startup_stage = app.startupStage;
  if (app.startupDescription !== undefined) db.startup_description = app.startupDescription;
  if (app.startupName !== undefined) db.startup_name = app.startupName;
  if (app.lookingFor !== undefined) db.looking_for = app.lookingFor;
  if (app.canHelp !== undefined) db.can_help = app.canHelp;
  if (app.needsHelp !== undefined) db.needs_help = app.needsHelp;
  if (app.aiUsage !== undefined) db.ai_usage = app.aiUsage;
  if (app.custom_1 !== undefined) db.custom_1 = app.custom_1;
  if (app.custom_2 !== undefined) db.custom_2 = app.custom_2;
  if (app.custom_3 !== undefined) db.custom_3 = app.custom_3;
  if (app.custom_4 !== undefined) db.custom_4 = app.custom_4;
  if (app.custom_5 !== undefined) db.custom_5 = app.custom_5;
  if (app.custom_6 !== undefined) db.custom_6 = app.custom_6;
  if (app.custom_7 !== undefined) db.custom_7 = app.custom_7;
  if (app.custom_array_1 !== undefined) db.custom_array_1 = app.custom_array_1;
  if (app.custom_array_2 !== undefined) db.custom_array_2 = app.custom_array_2;
  if (app.custom_array_3 !== undefined) db.custom_array_3 = app.custom_array_3;
  if (app.custom_array_4 !== undefined) db.custom_array_4 = app.custom_array_4;
  if (app.custom_array_5 !== undefined) db.custom_array_5 = app.custom_array_5;
  if (app.custom_array_6 !== undefined) db.custom_array_6 = app.custom_array_6;
  if (app.custom_array_7 !== undefined) db.custom_array_7 = app.custom_array_7;
  if (app._note !== undefined) db._note = app._note || "";
  if (app.embedding !== undefined) db.embedding = app.embedding;

  return db;
}

