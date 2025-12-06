import { getAllSkillsServer } from "@/lib/supabase/filters";
import { NextResponse } from "next/server";

// Force dynamic rendering since we fetch data from Supabase
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const skills = await getAllSkillsServer();
    return NextResponse.json(skills);
  } catch (error) {
    console.error("Failed to fetch skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

