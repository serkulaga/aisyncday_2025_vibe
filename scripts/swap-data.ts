/**
 * Data Swap Script
 * 
 * Validates and swaps between mocked and real participant data files
 * 
 * Usage:
 *   npx tsx scripts/swap-data.ts [--validate] [--backup] [--to-real] [--to-mocked]
 * 
 * Options:
 *   --validate: Only validate structure compatibility, don't swap
 *   --backup: Create backup before swapping
 *   --to-real: Switch to real data (participants.json)
 *   --to-mocked: Switch to mocked data (participants_mocked.json)
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, renameSync } from "fs";
import { join } from "path";

// File paths
const MOCKED_FILE = join(process.cwd(), "participants_mocked.json");
const REAL_FILE = join(process.cwd(), "participants.json");
const BACKUP_DIR = join(process.cwd(), ".backups");

// Expected participant structure (all required fields)
const REQUIRED_FIELDS = [
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

interface Participant {
  [key: string]: unknown;
}

/**
 * Validate that a file exists and has the correct structure
 */
function validateStructure(filePath: string): {
  valid: boolean;
  errors: string[];
  participantCount: number;
} {
  const errors: string[] = [];

  if (!existsSync(filePath)) {
    return {
      valid: false,
      errors: [`File does not exist: ${filePath}`],
      participantCount: 0,
    };
  }

  let data: unknown;
  try {
    const content = readFileSync(filePath, "utf-8");
    data = JSON.parse(content);
  } catch (error) {
    return {
      valid: false,
      errors: [
        `Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
      ],
      participantCount: 0,
    };
  }

  if (!Array.isArray(data)) {
    return {
      valid: false,
      errors: ["File must contain an array of participants"],
      participantCount: 0,
    };
  }

  const participants = data as Participant[];

  if (participants.length === 0) {
    errors.push("File contains no participants");
  }

  // Validate each participant
  participants.forEach((participant, index) => {
    for (const field of REQUIRED_FIELDS) {
      if (!(field in participant)) {
        errors.push(`Participant ${index} (id: ${participant.id || "unknown"}): Missing field "${field}"`);
      }
    }

    // Type validation
    if (typeof participant.id !== "number") {
      errors.push(`Participant ${index}: "id" must be a number`);
    }
    if (typeof participant.name !== "string") {
      errors.push(`Participant ${index}: "name" must be a string`);
    }
    if (!Array.isArray(participant.skills)) {
      errors.push(`Participant ${index}: "skills" must be an array`);
    }
    if (typeof participant.hasStartup !== "boolean") {
      errors.push(`Participant ${index}: "hasStartup" must be a boolean`);
    }
    if (!Array.isArray(participant.lookingFor)) {
      errors.push(`Participant ${index}: "lookingFor" must be an array`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    participantCount: participants.length,
  };
}

/**
 * Create backup of a file
 */
function createBackup(filePath: string): string {
  // Ensure backup directory exists
  if (!existsSync(BACKUP_DIR)) {
    const { mkdirSync } = require("fs");
    mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = require("path").basename(filePath);
  const backupPath = join(BACKUP_DIR, `${filename}.${timestamp}.backup`);

  copyFileSync(filePath, backupPath);
  return backupPath;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const validateOnly = args.includes("--validate");
  const createBackup = args.includes("--backup");
  const toReal = args.includes("--to-real");
  const toMocked = args.includes("--to-mocked");

  console.log("🔄 Data Swap Utility\n");

  // Validate both files
  console.log("📋 Validating file structures...\n");

  const mockedValidation = validateStructure(MOCKED_FILE);
  const realValidation = validateStructure(REAL_FILE);

  console.log(`Mocked file (${MOCKED_FILE}):`);
  if (mockedValidation.valid) {
    console.log(`  ✅ Valid (${mockedValidation.participantCount} participants)`);
  } else {
    console.log(`  ❌ Invalid:`);
    mockedValidation.errors.forEach((err) => console.log(`    - ${err}`));
  }

  console.log(`\nReal file (${REAL_FILE}):`);
  if (realValidation.valid) {
    console.log(`  ✅ Valid (${realValidation.participantCount} participants)`);
  } else {
    console.log(`  ❌ Invalid:`);
    realValidation.errors.forEach((err) => console.log(`    - ${err}`));
  }

  // Check structure compatibility
  if (!mockedValidation.valid || !realValidation.valid) {
    console.log("\n❌ Cannot proceed: One or both files are invalid");
    process.exit(1);
  }

  console.log("\n✅ Both files have compatible structures");

  if (validateOnly) {
    console.log("\n✅ Validation complete. No changes made.");
    return;
  }

  // Determine swap direction
  let swapTo: "real" | "mocked" | null = null;
  if (toReal && toMocked) {
    console.log("\n❌ Cannot specify both --to-real and --to-mocked");
    process.exit(1);
  } else if (toReal) {
    swapTo = "real";
  } else if (toMocked) {
    swapTo = "mocked";
  } else {
    // Default: check current mode and suggest
    const currentMode = process.env.USE_REAL_DATA === "true" ? "real" : "mocked";
    console.log(`\n💡 Current mode: ${currentMode}`);
    console.log("   Use --to-real or --to-mocked to swap");
    console.log("   Or use --validate to only check structure");
    return;
  }

  // Perform swap
  console.log(`\n🔄 Swapping to: ${swapTo}\n`);

  if (swapTo === "real") {
    // Switching to real data
    if (!realValidation.valid) {
      console.log("❌ Real data file is invalid. Cannot switch.");
      process.exit(1);
    }

    if (createBackup && existsSync(MOCKED_FILE)) {
      const backupPath = createBackup(MOCKED_FILE);
      console.log(`📦 Backup created: ${backupPath}`);
    }

    console.log("✅ Ready to use real data");
    console.log("\n📝 Next steps:");
    console.log("   1. Set environment variable: USE_REAL_DATA=true");
    console.log("   2. Run seeding script: npx tsx scripts/seed-participants.ts");
    console.log(`   3. Real data file: ${REAL_FILE}`);
  } else {
    // Switching to mocked data
    if (!mockedValidation.valid) {
      console.log("❌ Mocked data file is invalid. Cannot switch.");
      process.exit(1);
    }

    if (createBackup && existsSync(REAL_FILE)) {
      const backupPath = createBackup(REAL_FILE);
      console.log(`📦 Backup created: ${backupPath}`);
    }

    console.log("✅ Ready to use mocked data");
    console.log("\n📝 Next steps:");
    console.log("   1. Set environment variable: USE_REAL_DATA=false (or unset)");
    console.log("   2. Run seeding script: npx tsx scripts/seed-participants.ts");
    console.log(`   3. Mocked data file: ${MOCKED_FILE}`);
  }

  console.log("\n⚠️  IMPORTANT: Ensure participants.json is in .gitignore!");
}

// Run main function
main();

