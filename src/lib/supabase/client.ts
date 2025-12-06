/**
 * Supabase client helpers - Barrel exports
 * Re-exports from separate browser and server modules
 */

// Browser client (safe for client components)
export { createClient } from "./client-browser";

// Server client (server-only, contains next/headers)
export { createServerSupabaseClient } from "./client-server";

