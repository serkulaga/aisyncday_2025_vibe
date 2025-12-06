/**
 * Data Configuration
 * 
 * Manages switching between mocked and real participant data files
 */

import { existsSync } from "fs";
import { join } from "path";

/**
 * Data source mode
 */
export type DataSourceMode = "mocked" | "real";

/**
 * Default file paths
 */
export const DATA_PATHS = {
  mocked: join(process.cwd(), "participants_mocked.json"),
  real: join(process.cwd(), "participants.json"),
  // Alternative: could also be in src/data/
  mockedAlt: join(process.cwd(), "src", "data", "participants_mocked.json"),
  realAlt: join(process.cwd(), "src", "data", "participants.json"),
} as const;

/**
 * Get the current data source mode from environment variable
 */
export function getDataSourceMode(): DataSourceMode {
  const useReal = process.env.USE_REAL_DATA;
  
  // Check various forms: "true", "1", "yes", "on"
  if (
    useReal &&
    (useReal.toLowerCase() === "true" ||
      useReal === "1" ||
      useReal.toLowerCase() === "yes" ||
      useReal.toLowerCase() === "on")
  ) {
    return "real";
  }
  
  return "mocked"; // Default to mocked for safety
}

/**
 * Get the data file path based on current mode
 */
export function getDataFilePath(): string {
  const mode = getDataSourceMode();
  
  if (mode === "real") {
    // Try primary location first
    if (existsSync(DATA_PATHS.real)) {
      return DATA_PATHS.real;
    }
    // Try alternative location
    if (existsSync(DATA_PATHS.realAlt)) {
      return DATA_PATHS.realAlt;
    }
    // If real file doesn't exist, fall back to mocked
    console.warn(
      "⚠️  Real data file not found. Falling back to mocked data."
    );
  }
  
  // Use mocked data
  if (existsSync(DATA_PATHS.mocked)) {
    return DATA_PATHS.mocked;
  }
  if (existsSync(DATA_PATHS.mockedAlt)) {
    return DATA_PATHS.mockedAlt;
  }
  
  // If neither exists, return primary mocked path (will error when read)
  return DATA_PATHS.mocked;
}

/**
 * Get the active data source mode
 */
export function getActiveDataSource(): { mode: DataSourceMode; path: string } {
  const mode = getDataSourceMode();
  const path = getDataFilePath();
  
  return { mode, path };
}

/**
 * Check if real data file exists
 */
export function hasRealDataFile(): boolean {
  return existsSync(DATA_PATHS.real) || existsSync(DATA_PATHS.realAlt);
}

/**
 * Check if mocked data file exists
 */
export function hasMockedDataFile(): boolean {
  return existsSync(DATA_PATHS.mocked) || existsSync(DATA_PATHS.mockedAlt);
}

