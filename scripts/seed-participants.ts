/**
 * Seed script for participants data
 * 
 * Loads participants from JSON file and upserts into Supabase
 * 
 * Usage:
 *   npx tsx scripts/seed-participants.ts [path/to/participants.json]
 * 
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (for admin operations)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { DatabaseParticipant } from "../src/types/database";
import { getDataFilePath, getActiveDataSource } from "../src/lib/data/config";

// Load environment variables from .env.local if available
// This allows running the script directly without Next.js
try {
  const dotenv = require("dotenv");
  const result = dotenv.config({ path: ".env.local" });
  if (result.error) {
    console.warn("⚠️  Could not load .env.local:", result.error.message);
    console.warn("   Continuing with system environment variables...\n");
  } else if (result.parsed) {
    console.log("✅ Loaded environment variables from .env.local\n");
  }
} catch (error) {
  // dotenv not installed, try to load manually or rely on system environment variables
  console.warn("⚠️  dotenv not available. Install it with: npm install dotenv");
  console.warn("   Using system environment variables only...\n");
}

// Type for JSON participant (camelCase from file)
interface JsonParticipant {
  id: number;
  name: string;
  email: string;
  telegram: string;
  linkedin: string;
  photo: string;
  bio: string;
  skills: string[];
  hasStartup: boolean;
  startupStage: string;
  startupDescription: string;
  startupName: string;
  lookingFor: string[];
  canHelp: string;
  needsHelp: string;
  aiUsage: string;
  custom_1: string;
  custom_2: string;
  custom_3: string;
  custom_4: string;
  custom_5: string;
  custom_6: string;
  custom_7: string;
  custom_array_1: string[];
  custom_array_2: string[];
  custom_array_3: string[];
  custom_array_4: string[];
  custom_array_5: string[];
  custom_array_6: string[];
  custom_array_7: string[];
  _note?: string;
}

/**
 * Validate that a JSON object matches the expected participant shape
 */
function validateParticipant(obj: unknown): obj is JsonParticipant {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const p = obj as Record<string, unknown>;

  // Required fields
  const required = [
    "id",
    "name",
    "email",
    "telegram",
    "linkedin",
    "photo",
    "bio",
    "skills",
    "hasStartup",
    "startupStage",
    "startupDescription",
    "startupName",
    "lookingFor",
    "canHelp",
    "needsHelp",
    "aiUsage",
    "custom_1",
    "custom_2",
    "custom_3",
    "custom_4",
    "custom_5",
    "custom_6",
    "custom_7",
    "custom_array_1",
    "custom_array_2",
    "custom_array_3",
    "custom_array_4",
    "custom_array_5",
    "custom_array_6",
    "custom_array_7",
  ];

  for (const field of required) {
    if (!(field in p)) {
      console.warn(`⚠️  Missing required field: ${field}`);
      return false;
    }
  }

  // Type checks
  if (typeof p.id !== "number") return false;
  if (typeof p.name !== "string") return false;
  if (!Array.isArray(p.skills)) return false;
  if (typeof p.hasStartup !== "boolean") return false;
  if (!Array.isArray(p.lookingFor)) return false;

  return true;
}

/**
 * Convert JSON participant (camelCase) to database participant (snake_case)
 */
function jsonToDatabase(json: JsonParticipant): DatabaseParticipant {
  return {
    id: json.id,
    name: json.name,
    email: json.email || "",
    telegram: json.telegram || "",
    linkedin: json.linkedin || "",
    photo: json.photo || "",
    bio: json.bio || "",
    skills: json.skills || [],
    has_startup: json.hasStartup || false,
    startup_stage: json.startupStage || "",
    startup_description: json.startupDescription || "",
    startup_name: json.startupName || "",
    looking_for: json.lookingFor || [],
    can_help: json.canHelp || "",
    needs_help: json.needsHelp || "",
    ai_usage: json.aiUsage || "",
    custom_1: json.custom_1 || "",
    custom_2: json.custom_2 || "",
    custom_3: json.custom_3 || "",
    custom_4: json.custom_4 || "",
    custom_5: json.custom_5 || "",
    custom_6: json.custom_6 || "",
    custom_7: json.custom_7 || "",
    custom_array_1: json.custom_array_1 || [],
    custom_array_2: json.custom_array_2 || [],
    custom_array_3: json.custom_array_3 || [],
    custom_array_4: json.custom_array_4 || [],
    custom_array_5: json.custom_array_5 || [],
    custom_array_6: json.custom_array_6 || [],
    custom_array_7: json.custom_array_7 || [],
    _note: json._note || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    embedding: null, // Will be populated later
  };
}

/**
 * Main seeding function
 */
async function seedParticipants(jsonPath: string) {
  console.log("🚀 Starting participant seeding...\n");

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing required environment variables:");
    if (!supabaseUrl) console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceRoleKey) console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    console.error("\nPlease set these in your .env.local file or environment.");
    console.error("\n💡 Tip: Install dotenv to load .env.local automatically:");
    console.error("   npm install dotenv");
    console.error("\n💡 Or set environment variables manually before running the script.");
    process.exit(1);
  }

  // Create Supabase client with service role key (for admin operations)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Determine data source
  const { mode, path: configPath } = getActiveDataSource();
  
  // Use provided path or fall back to config
  const finalPath = jsonPath || configPath;
  
  if (!existsSync(finalPath)) {
    console.error(`❌ Data file not found: ${finalPath}`);
    console.error(`   Current mode: ${mode}`);
    console.error(`   Set USE_REAL_DATA=true to use real data`);
    process.exit(1);
  }

  // Load and parse JSON file
  console.log(`📖 Loading participants from: ${finalPath}`);
  console.log(`   Data source mode: ${mode}\n`);
  let jsonData: unknown;
  try {
    const fileContent = readFileSync(finalPath, "utf-8");
    jsonData = JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Failed to read or parse JSON file: ${error}`);
    process.exit(1);
  }

  // Validate it's an array
  if (!Array.isArray(jsonData)) {
    console.error("❌ JSON file must contain an array of participants");
    process.exit(1);
  }

  console.log(`✅ Loaded ${jsonData.length} participant records\n`);

  // Validate and transform participants
  const validParticipants: DatabaseParticipant[] = [];
  const invalidParticipants: unknown[] = [];

  console.log("🔍 Validating participants...");
  for (let i = 0; i < jsonData.length; i++) {
    const item = jsonData[i];
    if (validateParticipant(item)) {
      validParticipants.push(jsonToDatabase(item));
    } else {
      console.warn(`⚠️  Skipping invalid participant at index ${i}:`, item);
      invalidParticipants.push(item);
    }
  }

  console.log(`✅ Valid: ${validParticipants.length}`);
  if (invalidParticipants.length > 0) {
    console.log(`⚠️  Invalid: ${invalidParticipants.length}`);
  }
  console.log("");

  if (validParticipants.length === 0) {
    console.error("❌ No valid participants to seed");
    process.exit(1);
  }

  // Check existing participants to determine what will be created vs updated
  console.log("🔍 Checking existing participants...");
  const existingIds = new Set<number>();
  try {
    const { data: existing, error } = await supabase
      .from("participants")
      .select("id");

    if (error) {
      console.warn(`⚠️  Could not check existing participants: ${error.message}`);
      console.log("   Proceeding with upsert anyway...\n");
    } else if (existing) {
      existing.forEach((p) => existingIds.add(p.id));
      console.log(`   Found ${existingIds.size} existing participants\n`);
    }
  } catch (error) {
    console.warn(`⚠️  Error checking existing participants: ${error}`);
    console.log("   Proceeding with upsert anyway...\n");
  }

  // Upsert participants in batches
  const batchSize = 100;
  let created = 0;
  let updated = 0;
  let errors = 0;

  console.log(`📝 Upserting ${validParticipants.length} participants (batch size: ${batchSize})...\n`);

  for (let i = 0; i < validParticipants.length; i += batchSize) {
    const batch = validParticipants.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(validParticipants.length / batchSize);

    console.log(`   Processing batch ${batchNum}/${totalBatches} (${batch.length} participants)...`);

    try {
      // Upsert with conflict resolution on id
      const { data, error } = await supabase
        .from("participants")
        .upsert(batch, {
          onConflict: "id",
          ignoreDuplicates: false,
        })
        .select("id");

      if (error) {
        console.error(`   ❌ Batch ${batchNum} failed: ${error.message}`);
        errors += batch.length;
        continue;
      }

      // Count created vs updated based on whether ID was in existing set
      const inserted = data || [];
      for (const record of inserted) {
        if (existingIds.has(record.id)) {
          updated++;
        } else {
          created++;
          existingIds.add(record.id); // Track newly created IDs
        }
      }

      console.log(`   ✅ Batch ${batchNum} complete`);
    } catch (error) {
      console.error(`   ❌ Batch ${batchNum} failed with exception: ${error}`);
      errors += batch.length;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Seeding Summary");
  console.log("=".repeat(50));
  console.log(`✅ Created: ${created}`);
  console.log(`🔄 Updated: ${updated}`);
  if (errors > 0) {
    console.log(`❌ Errors: ${errors}`);
  }
  console.log(`📝 Total processed: ${validParticipants.length}`);
  console.log("=".repeat(50));

  if (errors > 0) {
    console.error("\n⚠️  Some participants failed to seed. Please check the errors above.");
    process.exit(1);
  } else {
    console.log("\n🎉 Seeding completed successfully!");
  }
}

// Main execution
// If path is provided as argument, use it; otherwise use config
const providedPath = process.argv[2];
const { path: configPath } = getActiveDataSource();
const jsonPath = providedPath || configPath;

seedParticipants(jsonPath).catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});

