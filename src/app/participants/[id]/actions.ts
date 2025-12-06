"use server";

/**
 * Server Actions for Participant Detail Page
 */

import { generateIntroMessage } from "@/lib/intro/generator";
import { getParticipantById } from "@/lib/supabase/participants";
import type { Participant } from "@/types";

export interface GenerateIntroParams {
  sourceParticipantId: number;
  targetParticipantId?: number;
  targetDescription?: string;
}

export type GenerateIntroResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Generate an intro message
 */
export async function generateIntro(
  params: GenerateIntroParams
): Promise<GenerateIntroResult> {
  try {
    // Validate input
    if (!params.targetParticipantId && !params.targetDescription) {
      return {
        success: false,
        error: "Either target participant or description must be provided",
      };
    }

    if (params.targetDescription && params.targetDescription.trim().length === 0) {
      return {
        success: false,
        error: "Target description cannot be empty",
      };
    }

    // Fetch source participant
    const sourceParticipant = await getParticipantById(params.sourceParticipantId);
    if (!sourceParticipant) {
      return {
        success: false,
        error: "Source participant not found",
      };
    }

    // Fetch target participant if ID provided
    let targetParticipant: Participant | undefined;
    if (params.targetParticipantId) {
      targetParticipant = (await getParticipantById(params.targetParticipantId)) ?? undefined;
      if (!targetParticipant) {
        return {
          success: false,
          error: "Target participant not found",
        };
      }
    }

    // Generate intro message
    const result = await generateIntroMessage(
      sourceParticipant,
      targetParticipant,
      params.targetDescription
    );

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error("Error generating intro:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate intro message",
    };
  }
}

