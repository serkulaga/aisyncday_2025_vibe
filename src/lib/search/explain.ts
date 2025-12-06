/**
 * LLM Explanation Generation
 * 
 * Generates natural language explanations for search results
 * using OpenAI GPT models with strict constraints to prevent hallucinations
 */

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Default LLM model for explanations
 */
const DEFAULT_LLM_MODEL = process.env.OPENAI_LLM_MODEL || "gpt-4o-mini";

/**
 * Format participant data for LLM context
 */
function formatParticipantForLLM(participant: {
  participant: any;
  relevanceScore: number;
  matchedFields?: any;
}): object {
  const p = participant.participant;
  return {
    name: p.name,
    skills: [...(p.skills || []), ...(p.custom_array_1 || [])],
    interests: p.custom_array_2 || [],
    bio: p.bio || "",
    canHelp: p.canHelp || "",
    needsHelp: p.needsHelp || "",
    hasStartup: p.hasStartup || false,
    startupName: p.startupName || null,
    lookingFor: p.lookingFor || [],
  };
}

/**
 * Build system prompt for LLM
 */
function buildSystemPrompt(): string {
  return `You are a helpful assistant that explains search results for a community networking platform at a tech hackathon. Your task is to explain why specific participants match a user's search query.

IMPORTANT CONSTRAINTS:
1. ONLY mention participants that are provided in the context below
2. DO NOT invent or hallucinate participant information
3. Base your explanation ONLY on the data provided
4. If a participant isn't in the context, do NOT mention them
5. Be concise and natural - 2-3 sentences maximum
6. Reference specific participant names when possible
7. Mention specific skills, interests, or attributes that match the query

Participant Schema:
- name: Full name
- skills: Array of technical/professional skills
- interests: Array of interests and hobbies
- bio: Short biography
- canHelp: What they can help others with
- needsHelp: What they need help with
- hasStartup: Whether they have a startup
- startupName: Startup name if applicable
- lookingFor: Array of things they're looking for

Generate a concise, helpful explanation that helps the user understand why these participants match their query.`;
}

/**
 * Generate explanation for search results
 * 
 * @param query - Original user query
 * @param participants - Matched participants with scores
 * @returns Explanation text and metadata
 */
export async function generateExplanation(
  query: string,
  participants: Array<{
    participant: any;
    relevanceScore: number;
    matchedFields?: any;
  }>
): Promise<{
  explanation: string;
  model: string;
  tokensUsed?: number;
  timeMs: number;
}> {
  const startTime = Date.now();

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  if (participants.length === 0) {
    return {
      explanation:
        "No participants matched your query. Try different keywords or broaden your search.",
      model: DEFAULT_LLM_MODEL,
      timeMs: Date.now() - startTime,
    };
  }

  // Format participants for LLM context
  const formattedParticipants = participants.map(formatParticipantForLLM);

  const systemPrompt = buildSystemPrompt();
  const userPrompt = `User Query: "${query}"

Participants Found:
${JSON.stringify(formattedParticipants, null, 2)}

Generate a concise explanation (2-3 sentences) describing why these participants match the query. Reference specific participant names and mention the skills, interests, or attributes that match.`;

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_LLM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more deterministic outputs
      max_tokens: 200, // Keep explanations concise
    });

    const explanation =
      response.choices[0]?.message?.content?.trim() ||
      "Found matching participants based on your query.";

    const tokensUsed =
      response.usage?.total_tokens || response.usage?.completion_tokens;

    return {
      explanation,
      model: DEFAULT_LLM_MODEL,
      tokensUsed,
      timeMs: Date.now() - startTime,
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

