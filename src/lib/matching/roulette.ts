/**
 * Coffee Break Roulette Matching Algorithm
 * 
 * Finds serendipitous connections based on skills, interests, and complementary needs
 */

import type { Participant } from "@/types";

export interface MatchResult {
  participant: Participant;
  score: number;
  sharedSkills: string[];
  sharedInterests: string[];
  explanation: string;
}

export interface MatchingOptions {
  excludeParticipantIds?: number[];
  excludeRedStatus?: boolean;
  maxResults?: number;
}

/**
 * Calculate intersection of two arrays
 */
function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
}

/**
 * Calculate union of two arrays
 */
function union<T>(a: T[], b: T[]): T[] {
  return [...new Set([...a, ...b])];
}

/**
 * Calculate skill overlap score
 */
function calculateSkillOverlap(
  skills1: string[],
  skills2: string[],
  parsedSkills1: string[],
  parsedSkills2: string[]
): { score: number; shared: string[] } {
  // Combine original and parsed skills
  const allSkills1 = [...new Set([...skills1, ...parsedSkills1])];
  const allSkills2 = [...new Set([...skills2, ...parsedSkills2])];

  const shared = intersection(allSkills1, allSkills2);
  const total = union(allSkills1, allSkills2);

  // Jaccard similarity for skills (weight: 0.4)
  const score = total.length > 0 ? (shared.length / total.length) * 0.4 : 0;

  return { score, shared };
}

/**
 * Calculate interest overlap score
 */
function calculateInterestOverlap(
  interests1: string[],
  interests2: string[]
): { score: number; shared: string[] } {
  const shared = intersection(interests1, interests2);
  const maxLength = Math.max(interests1.length, interests2.length);

  // Normalized overlap for interests (weight: 0.3)
  const score =
    maxLength > 0 ? (shared.length / maxLength) * 0.3 : 0;

  return { score, shared };
}

/**
 * Calculate complementary needs score
 */
function calculateComplementaryScore(
  canHelp1: string,
  needsHelp1: string,
  canHelp2: string,
  needsHelp2: string
): number {
  let score = 0;

  // Check if person1 can help with what person2 needs
  if (canHelp1 && needsHelp2) {
    const canHelpLower = canHelp1.toLowerCase();
    const needsHelpLower = needsHelp2.toLowerCase();
    
    // Simple keyword matching (could be improved with NLP)
    const keywords1 = canHelpLower.split(/\s+/);
    const keywords2 = needsHelpLower.split(/\s+/);
    
    // Check for any significant keyword overlap
    const overlap = intersection(keywords1, keywords2);
    if (overlap.length > 0 && overlap.length >= Math.min(keywords1.length, keywords2.length) * 0.3) {
      score += 0.1;
    }
  }

  // Check if person2 can help with what person1 needs
  if (canHelp2 && needsHelp1) {
    const canHelpLower = canHelp2.toLowerCase();
    const needsHelpLower = needsHelp1.toLowerCase();
    
    const keywords1 = canHelpLower.split(/\s+/);
    const keywords2 = needsHelpLower.split(/\s+/);
    
    const overlap = intersection(keywords1, keywords2);
    if (overlap.length > 0 && overlap.length >= Math.min(keywords1.length, keywords2.length) * 0.3) {
      score += 0.1;
    }
  }

  // Weight: 0.2 total
  return Math.min(score, 0.2);
}

/**
 * Calculate non-obvious connections score
 */
function calculateNonObviousScore(
  participant1: Participant,
  participant2: Participant
): number {
  let score = 0;

  // Same startup stage
  if (
    participant1.startupStage &&
    participant2.startupStage &&
    participant1.startupStage === participant2.startupStage &&
    participant1.startupStage !== ""
  ) {
    score += 0.05;
  }

  // Both have startups or both don't
  if (participant1.hasStartup === participant2.hasStartup) {
    score += 0.02;
  }

  // Looking for similar things
  const sharedLookingFor = intersection(
    participant1.lookingFor,
    participant2.lookingFor
  );
  if (sharedLookingFor.length > 0) {
    score += 0.03;
  }

  // Weight: 0.1 total
  return Math.min(score, 0.1);
}

/**
 * Generate explanation for why two participants match
 */
function generateExplanation(
  participant: Participant,
  sharedSkills: string[],
  sharedInterests: string[],
  score: number
): string {
  const reasons: string[] = [];

  if (sharedSkills.length > 0) {
    if (sharedSkills.length === 1) {
      reasons.push(`Both know ${sharedSkills[0]}`);
    } else if (sharedSkills.length <= 3) {
      reasons.push(`Share skills: ${sharedSkills.join(", ")}`);
    } else {
      reasons.push(`Share ${sharedSkills.length} skills including ${sharedSkills.slice(0, 2).join(", ")}`);
    }
  }

  if (sharedInterests.length > 0) {
    if (sharedInterests.length === 1) {
      reasons.push(`Both interested in ${sharedInterests[0]}`);
    } else {
      reasons.push(`Share interests: ${sharedInterests.slice(0, 3).join(", ")}`);
    }
  }

  // Add complementary needs if relevant
  if (participant.canHelp || participant.needsHelp) {
    reasons.push("Complementary skills and needs");
  }

  if (reasons.length === 0) {
    return "Potential interesting connection based on profiles";
  }

  return reasons.join(". ") + ".";
}

/**
 * Find matches for a participant
 */
export async function findMatches(
  currentParticipant: Participant,
  allParticipants: Participant[],
  options: MatchingOptions = {}
): Promise<MatchResult[]> {
  const {
    excludeParticipantIds = [],
    excludeRedStatus = true,
    maxResults = 3,
  } = options;

  const matches: MatchResult[] = [];

  for (const candidate of allParticipants) {
    // Skip self
    if (candidate.id === currentParticipant.id) {
      continue;
    }

    // Skip excluded participants
    if (excludeParticipantIds.includes(candidate.id)) {
      continue;
    }

    // Skip red status if option is set
    if (excludeRedStatus) {
      const status = candidate.custom_5?.toLowerCase().trim();
      if (status === "red") {
        continue;
      }
    }

    // Calculate skill overlap
    const skillOverlap = calculateSkillOverlap(
      currentParticipant.skills,
      candidate.skills,
      currentParticipant.custom_array_1 || [],
      candidate.custom_array_1 || []
    );

    // Calculate interest overlap
    const interestOverlap = calculateInterestOverlap(
      currentParticipant.custom_array_2 || [],
      candidate.custom_array_2 || []
    );

    // Calculate complementary needs
    const complementaryScore = calculateComplementaryScore(
      currentParticipant.canHelp,
      currentParticipant.needsHelp,
      candidate.canHelp,
      candidate.needsHelp
    );

    // Calculate non-obvious connections
    const nonObviousScore = calculateNonObviousScore(
      currentParticipant,
      candidate
    );

    // Total score (normalized to 0-1)
    const totalScore =
      skillOverlap.score +
      interestOverlap.score +
      complementaryScore +
      nonObviousScore;

    // Only include matches with meaningful score
    if (totalScore > 0.1) {
      matches.push({
        participant: candidate,
        score: totalScore,
        sharedSkills: skillOverlap.shared,
        sharedInterests: interestOverlap.shared,
        explanation: generateExplanation(
          candidate,
          skillOverlap.shared,
          interestOverlap.shared,
          totalScore
        ),
      });
    }
  }

  // Sort by score descending and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

