/**
 * Browser storage utilities for current participant selection
 */

const CURRENT_PARTICIPANT_KEY = "community_os_current_participant_id";

/**
 * Get the current participant ID from localStorage
 */
export function getCurrentParticipantId(): number | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(CURRENT_PARTICIPANT_KEY);
    if (stored) {
      const id = parseInt(stored, 10);
      return isNaN(id) ? null : id;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Set the current participant ID in localStorage
 */
export function setCurrentParticipantId(id: number | null): void {
  if (typeof window === "undefined") return;
  
  try {
    if (id === null) {
      localStorage.removeItem(CURRENT_PARTICIPANT_KEY);
    } else {
      localStorage.setItem(CURRENT_PARTICIPANT_KEY, id.toString());
    }
  } catch (error) {
    console.error("Failed to save current participant ID:", error);
  }
}

/**
 * Clear the current participant ID
 */
export function clearCurrentParticipantId(): void {
  setCurrentParticipantId(null);
}

