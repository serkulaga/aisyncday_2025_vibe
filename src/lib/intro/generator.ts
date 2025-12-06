/**
 * Intro Message Generator
 * 
 * Generates personalized introduction messages using LLM
 * Grounded in actual participant data to prevent hallucinations
 */

import OpenAI from "openai";
import type { Participant } from "@/types";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Default LLM model for intro generation
 */
const DEFAULT_LLM_MODEL = process.env.OPENAI_LLM_MODEL || "gpt-4o-mini";

/**
 * Format participant data for LLM context
 */
function formatParticipantForLLM(participant: Participant): string {
  const parts: string[] = [];

  parts.push(`Name: ${participant.name}`);
  
  if (participant.bio) {
    parts.push(`Bio: ${participant.bio}`);
  }
  
  if (participant.custom_1) {
    parts.push(`Enhanced Bio: ${participant.custom_1}`);
  }

  const allSkills = [
    ...(participant.skills || []),
    ...(participant.custom_array_1 || []),
  ];
  if (allSkills.length > 0) {
    parts.push(`Skills: ${allSkills.join(", ")}`);
  }

  const interests = participant.custom_array_2 || [];
  if (interests.length > 0) {
    parts.push(`Interests: ${interests.join(", ")}`);
  }

  if (participant.canHelp) {
    parts.push(`Can Help With: ${participant.canHelp}`);
  }

  if (participant.needsHelp) {
    parts.push(`Needs Help With: ${participant.needsHelp}`);
  }

  if (participant.lookingFor && participant.lookingFor.length > 0) {
    parts.push(`Looking For: ${participant.lookingFor.join(", ")}`);
  }

  if (participant.hasStartup) {
    if (participant.startupName) {
      parts.push(`Startup: ${participant.startupName}`);
    }
    if (participant.startupStage) {
      parts.push(`Startup Stage: ${participant.startupStage}`);
    }
    if (participant.startupDescription) {
      parts.push(`Startup Description: ${participant.startupDescription}`);
    }
  }

  if (participant.aiUsage) {
    parts.push(`AI Usage: ${participant.aiUsage}`);
  }

  return parts.join("\n");
}

/**
 * Build system prompt for intro generation
 */
function buildSystemPrompt(): string {
  return `You are a helpful assistant that generates professional, friendly introduction messages for connecting people at tech events.

IMPORTANT RULES:
1. ONLY use information provided about the participants. Do NOT invent or assume any facts.
2. Keep the message concise (2-4 sentences maximum)
3. Write in a friendly, professional tone suitable for Telegram or LinkedIn
4. Focus on concrete, specific details that would help the connection
5. DO NOT use emojis unless the user explicitly requests them
6. Make it clear why these two people should connect
7. If you don't have enough information, keep it simple and professional

Format:
- Start with a friendly greeting
- Mention what the source person does/is interested in (based on provided data)
- Mention what the target person/audience is interested in
- Suggest why they might want to connect
- Keep it natural and conversational`;
}

/**
 * Generate an introduction message
 * 
 * @param sourceParticipant - The person being introduced
 * @param targetParticipant - Optional: the person they're being introduced to
 * @param targetDescription - Optional: description of target audience if no specific participant
 * @returns Generated intro message
 */
export async function generateIntroMessage(
  sourceParticipant: Participant,
  targetParticipant?: Participant,
  targetDescription?: string
): Promise<{
  message: string;
  model: string;
  tokensUsed?: number;
}> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  if (!targetParticipant && !targetDescription) {
    throw new Error("Either targetParticipant or targetDescription must be provided");
  }

  const sourceInfo = formatParticipantForLLM(sourceParticipant);
  const targetInfo = targetParticipant
    ? formatParticipantForLLM(targetParticipant)
    : `Target Audience: ${targetDescription}`;

  const systemPrompt = buildSystemPrompt();
  
  const userPrompt = `Generate an introduction message for connecting these people:

**Person being introduced:**
${sourceInfo}

**Target person/audience:**
${targetInfo}

Generate a short, friendly intro message (2-4 sentences, no emojis) that the user can copy and paste into Telegram or another messaging platform.`;

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_LLM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7, // Slightly higher for more natural conversation
      max_tokens: 200, // Keep it concise
    });

    const message =
      response.choices[0]?.message?.content?.trim() ||
      `Hi! I'd like to introduce you to ${sourceParticipant.name}.`;

    const tokensUsed =
      response.usage?.total_tokens || response.usage?.completion_tokens;

    return {
      message,
      model: DEFAULT_LLM_MODEL,
      tokensUsed,
    };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(
        `OpenAI API error: ${error.message} (status: ${error.status})`
      );
    }
    throw error;
  }
}

