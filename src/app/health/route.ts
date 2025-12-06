import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client-server";

/**
 * Health check endpoint
 * 
 * Verifies:
 * - Supabase connectivity
 * - Environment variables are set
 * - Database is accessible
 * 
 * Useful for monitoring and debugging deployment issues
 */
export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; message: string }> = {};

  // Check environment variables
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  checks.environment = {
    status: hasSupabaseUrl && hasSupabaseKey ? "ok" : "error",
    message: hasSupabaseUrl && hasSupabaseKey
      ? "Required environment variables present"
      : `Missing: ${!hasSupabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL " : ""}${!hasSupabaseKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : ""}`.trim(),
  };

  checks.openai = {
    status: hasOpenAIKey ? "ok" : "ok", // OpenAI is optional for basic functionality
    message: hasOpenAIKey ? "OpenAI API key present" : "OpenAI API key not set (search features may not work)",
  };

  // Check Supabase connectivity
  try {
    const supabase = createServerSupabaseClient();
    
    // Try a simple query to verify connectivity
    const { count, error } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true });

    if (error) {
      checks.supabase = {
        status: "error",
        message: `Supabase connection error: ${error.message}`,
      };
    } else {
      checks.supabase = {
        status: "ok",
        message: "Supabase connected successfully",
      };
    }
  } catch (error) {
    checks.supabase = {
      status: "error",
      message: `Supabase connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }

  // Determine overall status
  const allChecksOk = Object.values(checks).every((check) => check.status === "ok");
  const overallStatus = allChecksOk ? "healthy" : "degraded";

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      environment: {
        hasSupabaseUrl,
        hasSupabaseKey,
        hasOpenAIKey,
        nodeEnv: process.env.NODE_ENV || "development",
      },
    },
    {
      status: allChecksOk ? 200 : 503,
    }
  );
}

