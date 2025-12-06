/**
 * Re-ranking Logic
 * 
 * Boosts participant relevance scores based on keyword matches
 * in structured fields (skills, interests, bio, etc.)
 */

import type { Participant } from "@/types";
import type { ParticipantMatch, MatchedFields } from "./types";

/**
 * Extract keywords from a query (simple tokenization)
 */
function extractKeywords(query: string): string[] {
  // Convert to lowercase, split by non-word characters, filter empty strings
  return query
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2) // Ignore very short words
    .filter((word) => {
      // Filter out common stop words
      const stopWords = new Set([
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
        "who",
        "here",
        "people",
        "show",
        "me",
        "find",
        "are",
        "can",
        "has",
        "have",
        "need",
        "needs",
        "help",
        "helps",
        "working",
        "looking",
        "interested",
      ]);
      return !stopWords.has(word);
    });
}

/**
 * Check if text contains any of the keywords (case-insensitive)
 */
function containsKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword));
}

/**
 * Calculate keyword boost score for a participant
 * 
 * @param participant - Participant to score
 * @param keywords - Extracted keywords from query
 * @param originalSimilarity - Original vector similarity score
 * @returns Boost score (0-1) and matched fields
 */
export function calculateKeywordBoost(
  participant: Participant,
  keywords: string[],
  originalSimilarity: number,
  query: string = ""
): {
  boost: number;
  matchedFields: MatchedFields;
} {
  const matchedFields: MatchedFields = {};
  let boost = 0;

  // Check skills (high weight)
  const allSkills = [
    ...(participant.skills || []),
    ...(participant.custom_array_1 || []),
  ];
  
  // Check for exact phrase matches first (e.g., "computer vision" as a phrase)
  const queryLower = query.toLowerCase();
  const exactPhraseMatches = allSkills.filter((skill) =>
    skill.toLowerCase().includes(queryLower)
  );
  
  // Then check for keyword matches
  const keywordMatches = allSkills.filter((skill) =>
    keywords.some((keyword) => skill.toLowerCase().includes(keyword))
  );
  
  // Combine matches, prioritizing exact phrase matches
  const matchedSkills = exactPhraseMatches.length > 0 
    ? exactPhraseMatches 
    : keywordMatches;
    
  if (matchedSkills.length > 0) {
    matchedFields.skills = matchedSkills;
    // Higher boost for exact phrase matches (0.4) vs keyword matches (0.2)
    const baseBoost = exactPhraseMatches.length > 0 ? 0.4 : 0.2;
    boost += Math.min(baseBoost, (matchedSkills.length / Math.max(allSkills.length, 1)) * 0.5);
  }

  // Check interests (medium weight)
  const interests = participant.custom_array_2 || [];
  const matchedInterests = interests.filter((interest) =>
    keywords.some((keyword) => interest.toLowerCase().includes(keyword))
  );
  if (matchedInterests.length > 0) {
    matchedFields.interests = matchedInterests;
    boost += Math.min(0.15, (matchedInterests.length / Math.max(interests.length, 1)) * 0.2);
  }

  // Check canHelp (medium weight)
  if (participant.canHelp && containsKeywords(participant.canHelp, keywords)) {
    matchedFields.canHelp = true;
    boost += 0.1;
  }

  // Check needsHelp (medium weight)
  if (
    participant.needsHelp &&
    containsKeywords(participant.needsHelp, keywords)
  ) {
    matchedFields.needsHelp = true;
    boost += 0.1;
  }

  // Check bio (low weight, but indicates relevance)
  if (participant.bio && containsKeywords(participant.bio, keywords)) {
    matchedFields.bio = participant.bio.substring(0, 100); // Store snippet
    boost += 0.05;
  }

  // Check enhanced bio (custom_1)
  if (participant.custom_1 && containsKeywords(participant.custom_1, keywords)) {
    if (!matchedFields.bio) {
      matchedFields.bio = participant.custom_1.substring(0, 100);
    }
    boost += 0.05;
  }

  // Startup-related boosts
  if (
    keywords.some((k) => ["startup", "founder", "funding", "fundraising"].includes(k))
  ) {
    if (participant.hasStartup) {
      boost += 0.1;
    }
    if (participant.startupName) {
      boost += 0.05;
    }
  }

  // Cap boost at 0.5 (so original similarity still matters)
  boost = Math.min(boost, 0.5);

  return { boost, matchedFields };
}

/**
 * Re-rank participants based on keyword matching
 * 
 * @param participants - Participants with initial similarity scores
 * @param query - Original user query
 * @returns Re-ranked participants with final relevance scores
 */
export function rerankParticipants(
  participants: Array<{
    participant: Participant;
    similarityScore: number;
  }>,
  query: string
): ParticipantMatch[] {
  const keywords = extractKeywords(query);

  // Calculate final scores with boosts
  const ranked = participants.map((item) => {
    const { boost, matchedFields } = calculateKeywordBoost(
      item.participant,
      keywords,
      item.similarityScore,
      query
    );

    // Combine original similarity (0-1) with boost (0-0.5)
    // If there's a strong keyword boost (exact skill match), prioritize it more
    // If boost > 0.3, it's likely an exact match, so give it 50/50 weight
    // Otherwise, 70% vector similarity, 30% keyword matching
    const keywordWeight = boost > 0.3 ? 0.5 : 0.3;
    const similarityWeight = 1 - keywordWeight;
    const relevanceScore = Math.min(
      1.0,
      item.similarityScore * similarityWeight + boost * keywordWeight
    );

    return {
      participant: item.participant,
      relevanceScore,
      similarityScore: item.similarityScore,
      matchedFields,
    };
  });

  // Sort by final relevance score descending
  ranked.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return ranked;
}

