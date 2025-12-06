/**
 * Generate embeddings for participants
 * 
 * Iterates through participants in Supabase, generates embeddings using OpenAI,
 * and stores them in the database.
 * 
 * Usage:
 *   npx tsx scripts/generate-embeddings.ts [--all] [--participant-id=1,2,3]
 * 
 * Options:
 *   --all: Regenerate embeddings for all participants (even if they exist)
 *   --participant-id=1,2,3: Only process specific participant IDs (comma-separated)
 * 
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (for admin operations)
 *   OPENAI_API_KEY - OpenAI API key for generating embeddings
 *   OPENAI_EMBEDDING_MODEL - (Optional) OpenAI embedding model name (default: text-embedding-3-small)
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { join } from "path";
import type { DatabaseParticipant } from "../src/types/database";

// Load environment variables
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
  console.warn("⚠️  dotenv not available. Install it with: npm install dotenv");
  console.warn("   Using system environment variables only...\n");
}

/**
 * Combine participant fields into searchable text for embedding
 * Based on CUSTOM_FIELDS_GUIDE.md recommendations for Agentic Search
 */
function buildSearchableText(participant: DatabaseParticipant): string {
  const parts: string[] = [];

  // Original fields
  if (participant.bio) parts.push(participant.bio);
  if (participant.skills && participant.skills.length > 0) {
    parts.push(`Skills: ${participant.skills.join(", ")}`);
  }
  if (participant.can_help) parts.push(`Can help with: ${participant.can_help}`);
  if (participant.needs_help) parts.push(`Needs help with: ${participant.needs_help}`);
  if (participant.ai_usage) parts.push(`AI usage: ${participant.ai_usage}`);
  if (participant.looking_for && participant.looking_for.length > 0) {
    parts.push(`Looking for: ${participant.looking_for.join(", ")}`);
  }
  if (participant.startup_description) {
    parts.push(`Startup: ${participant.startup_description}`);
  }

  // Custom fields for enhanced search (from CUSTOM_FIELDS_GUIDE.md)
  // custom_1: Enhanced/parsed bio
  if (participant.custom_1) parts.push(participant.custom_1);
  
  // custom_array_1: Parsed/extracted skills
  if (participant.custom_array_1 && participant.custom_array_1.length > 0) {
    parts.push(`Additional skills: ${participant.custom_array_1.join(", ")}`);
  }
  
  // custom_array_2: Interests/hobbies
  if (participant.custom_array_2 && participant.custom_array_2.length > 0) {
    parts.push(`Interests: ${participant.custom_array_2.join(", ")}`);
  }
  
  // custom_array_5: Custom tags
  if (participant.custom_array_5 && participant.custom_array_5.length > 0) {
    parts.push(`Tags: ${participant.custom_array_5.join(", ")}`);
  }

  // Join all parts with newlines for better separation
  return parts.filter(Boolean).join("\n\n");
}

/**
 * Generate embedding using OpenAI API
 */
async function generateEmbedding(
  text: string,
  openai: OpenAI,
  model: string
): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: model,
      input: text,
      dimensions: 1536, // Match our database schema
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No embedding returned from OpenAI");
    }

    return response.data[0].embedding;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Process a single participant: generate embedding and update database
 */
async function processParticipant(
  participant: DatabaseParticipant,
  supabase: ReturnType<typeof createClient>,
  openai: OpenAI,
  model: string,
  forceRegenerate: boolean
): Promise<{ success: boolean; participantId: number; error?: string }> {
  try {
    // Skip if embedding exists and not forcing regeneration
    if (participant.embedding && participant.embedding.length > 0 && !forceRegenerate) {
      return { success: true, participantId: participant.id };
    }

    // Build searchable text
    const searchableText = buildSearchableText(participant);

    if (!searchableText.trim()) {
      return {
        success: false,
        participantId: participant.id,
        error: "No searchable text available for participant",
      };
    }

    // Generate embedding
    const embedding = await generateEmbedding(searchableText, openai, model);

    // Update database
    const { error: updateError } = await supabase
      .from("participants")
      .update({ embedding } as any)
      .eq("id", participant.id);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    return { success: true, participantId: participant.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      participantId: participant.id,
      error: errorMessage,
    };
  }
}

/**
 * Main function to generate embeddings for participants
 */
async function generateEmbeddingsForParticipants(
  forceAll: boolean = false,
  participantIds?: number[]
) {
  console.log("🚀 Starting embedding generation...\n");

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing required Supabase environment variables:");
    if (!supabaseUrl) console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceRoleKey) console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  if (!openaiApiKey) {
    console.error("❌ Missing required OpenAI environment variable:");
    console.error("   - OPENAI_API_KEY");
    console.error("\nGet your API key from: https://platform.openai.com/api-keys");
    process.exit(1);
  }

  // Initialize clients
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const openai = new OpenAI({
    apiKey: openaiApiKey,
  });

  console.log(`✅ Using embedding model: ${embeddingModel}`);
  console.log(`✅ Force regenerate all: ${forceAll ? "Yes" : "No (skip existing)"}`);
  if (participantIds) {
    console.log(`✅ Processing specific IDs: ${participantIds.join(", ")}\n`);
  } else {
    console.log(`✅ Processing all participants\n`);
  }

  // Fetch participants
  let query = supabase.from("participants").select("*");

  if (participantIds && participantIds.length > 0) {
    query = query.in("id", participantIds);
  }

  const { data: participants, error: fetchError } = await query;

  if (fetchError) {
    console.error(`❌ Failed to fetch participants: ${fetchError.message}`);
    process.exit(1);
  }

  if (!participants || participants.length === 0) {
    console.log("ℹ️  No participants found to process.");
    process.exit(0);
  }

  const total = participants.length;
  let processed = 0;
  let succeeded = 0;
  let skipped = 0;
  let failed = 0;
  const errors: Array<{ id: number; error: string }> = [];

  console.log(`📝 Found ${total} participant(s) to process\n`);

  // Process participants in batches (to avoid rate limits)
  const batchSize = 10;
  for (let i = 0; i < participants.length; i += batchSize) {
    const batch = participants.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(participants.length / batchSize);

    console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} participants)...`);

    const batchResults = await Promise.all(
      batch.map((participant) =>
        processParticipant(
          participant as DatabaseParticipant,
          supabase,
          openai,
          embeddingModel,
          forceAll
        )
      )
    );

    for (const result of batchResults) {
      processed++;
      if (result.success) {
        if (
          (participants.find((p) => p.id === result.participantId) as DatabaseParticipant)
            ?.embedding &&
          !forceAll
        ) {
          skipped++;
        } else {
          succeeded++;
          console.log(`   ✅ Participant ${result.participantId}: Embedding generated`);
        }
      } else {
        failed++;
        errors.push({ id: result.participantId, error: result.error || "Unknown error" });
        console.log(`   ❌ Participant ${result.participantId}: ${result.error}`);
      }
    }

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < participants.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Embedding Generation Summary");
  console.log("=".repeat(50));
  console.log(`✅ Generated: ${succeeded}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }
  console.log(`📝 Total processed: ${processed}`);
  console.log("=".repeat(50));

  if (errors.length > 0) {
    console.log("\n❌ Errors encountered:");
    errors.forEach(({ id, error }) => {
      console.log(`   - Participant ${id}: ${error}`);
    });
  }

  if (failed > 0) {
    console.error("\n⚠️  Some embeddings failed to generate. Check errors above.");
    process.exit(1);
  } else {
    console.log("\n🎉 All embeddings generated successfully!");
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const forceAll = args.includes("--all");
const participantIdsArg = args.find((arg) => arg.startsWith("--participant-id="));
const participantIds = participantIdsArg
  ? participantIdsArg
      .split("=")[1]
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id))
  : undefined;

// Run the script
generateEmbeddingsForParticipants(forceAll, participantIds).catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});

