/**
 * Browser-side Supabase client
 * Use this in client components and browser code
 */

import { createBrowserClient } from "@supabase/ssr";
import type { DatabaseParticipant } from "@/types/database";

/**
 * Browser-side Supabase client
 * Use this in client components and browser code
 * 
 * @returns Supabase client instance for browser
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createBrowserClient<{ participants: DatabaseParticipant }>(
    supabaseUrl,
    supabaseAnonKey
  );
}

