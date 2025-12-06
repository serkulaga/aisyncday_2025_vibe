"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Shuffle, User, Sparkles, Target, Users, Loader2, AlertCircle } from "lucide-react";
import { getCurrentParticipantId, setCurrentParticipantId } from "@/lib/utils/storage";
import { getParticipantByIdClient, getAllParticipantsClient } from "@/lib/supabase/participants-client";
import { findMatches } from "@/lib/matching/roulette";
import type { Participant } from "@/types";
import type { MatchResult } from "@/lib/matching/roulette";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface RouletteManagerProps {
  participants: Participant[];
}

function MatchCard({ match }: { match: MatchResult }) {
  const participant = match.participant;
  const initials = participant.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const scorePercentage = Math.round(match.score * 100);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {participant.photo ? (
              <img
                src={participant.photo}
                alt={participant.name}
                className="h-16 w-16 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xl">{participant.name}</CardTitle>
              <CardDescription className="mt-1">
                <span className="text-primary font-semibold">{scorePercentage}%</span> match
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Match Explanation */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm">{match.explanation}</p>
          </div>
        </div>

        {/* Shared Skills */}
        {match.sharedSkills.length > 0 && (
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Shared Skills
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {match.sharedSkills.slice(0, 5).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {match.sharedSkills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{match.sharedSkills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Shared Interests */}
        {match.sharedInterests.length > 0 && (
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Shared Interests
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {match.sharedInterests.slice(0, 5).map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Key Skills */}
        {participant.skills.length > 0 && (
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Key Skills
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {participant.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/participants/${participant.id}`}>View Profile</Link>
          </Button>
          {participant.telegram && (
            <Button
              asChild
              variant="default"
              size="sm"
              className="flex-1"
            >
              <a
                href={`https://t.me/${participant.telegram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RouletteManager({ participants }: RouletteManagerProps) {
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [previousMatchIds, setPreviousMatchIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  // Load saved participant selection on mount
  useEffect(() => {
    const savedId = getCurrentParticipantId();
    if (savedId) {
      setSelectedParticipantId(savedId);
    } else if (participants.length > 0) {
      // Default to first participant if none selected
      setSelectedParticipantId(participants[0].id);
    }
  }, [participants]);

  // Load participant data when selection changes
  useEffect(() => {
    if (selectedParticipantId) {
      setLoading(true);
      getParticipantByIdClient(selectedParticipantId)
        .then((participant) => {
          if (participant) {
            setCurrentParticipant(participant);
          }
        })
        .catch((error) => {
          console.error("Failed to load participant:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedParticipantId]);

  const handleParticipantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      const id = parseInt(value, 10);
      if (!isNaN(id)) {
        setSelectedParticipantId(id);
        setCurrentParticipantId(id);
        setMatches([]);
        setPreviousMatchIds([]);
        setHasSpun(false);
      }
    } else {
      setSelectedParticipantId(null);
      setCurrentParticipant(null);
      setMatches([]);
    }
  };

  const handleSpin = async () => {
    if (!currentParticipant) return;

    setMatching(true);
    setHasSpun(true);

    try {
      // Refresh all participants to get latest data
      const { data: allParticipants } = await getAllParticipantsClient({ limit: 100 });

      // Find matches, excluding previous matches if spinning again
      const results = await findMatches(currentParticipant, allParticipants, {
        excludeRedStatus: true,
        excludeParticipantIds: previousMatchIds,
        maxResults: 3,
      });

      setMatches(results);
      
      // Track these matches to exclude them in next spin
      if (results.length > 0) {
        setPreviousMatchIds((prev) => [
          ...prev,
          ...results.map((m) => m.participant.id),
        ]);
      }
    } catch (error) {
      console.error("Failed to find matches:", error);
      setMatches([]);
    } finally {
      setMatching(false);
    }
  };

  if (participants.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No participants found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Participant Selection */}
      <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold tracking-tight">Select Participant</CardTitle>
          <CardDescription>
            Choose which participant you are to find matches
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-2">
            <Label htmlFor="participant-select">Participant</Label>
            <select
              id="participant-select"
              value={selectedParticipantId?.toString() || ""}
              onChange={handleParticipantChange}
              disabled={loading || matching}
              className="w-full h-11 rounded-lg border-2 border-gray-200 bg-gradient-to-b from-white to-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:from-white hover:to-white focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-offset-1 focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:shadow-sm"
            >
              <option value="">Select a participant</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Your selection will be saved for future visits
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="relative z-0 mt-8">
        {loading ? (
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Loading participant data...</p>
          </CardContent>
        </Card>
      ) : currentParticipant ? (
        <>
          {/* Spin Button */}
          <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight">Find Your Match</CardTitle>
              <CardDescription>
                Click the button below to discover interesting connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSpin}
                disabled={matching}
                size="lg"
                className="w-full sm:w-auto"
              >
                {matching ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Finding matches...
                  </>
                ) : (
                  <>
                    <Shuffle className="h-5 w-5 mr-2" />
                    Spin the Roulette
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Match Results */}
          {hasSpun && !matching && (
            <>
              {matches.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      No matches found at this time.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Try updating your skills and interests, or check back later when more
                      participants have joined.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Your Matches</h2>
                    <p className="text-sm text-muted-foreground">
                      Found {matches.length} match{matches.length !== 1 ? "es" : ""}
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {matches.map((match) => (
                      <MatchCard key={match.participant.id} match={match} />
                    ))}
                  </div>

                  {/* Try Again Button */}
                  <div className="text-center">
                    <Button
                      onClick={handleSpin}
                      disabled={matching}
                      variant="outline"
                    >
                      <Shuffle className="h-4 w-4 mr-2" />
                      Spin Again
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Please select a participant to find matches.
            </p>
          </CardContent>
        </Card>
        )}
      </div>

      {/* How It Works */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Our matching algorithm finds connections based on:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Shared skills and expertise (40% weight)</li>
            <li>Common interests and hobbies (30% weight)</li>
            <li>Complementary needs - you can help with what they need (20% weight)</li>
            <li>Non-obvious connections - similar backgrounds or goals (10% weight)</li>
          </ul>
          <p className="pt-2">
            Matches exclude participants currently in "Deep Work" mode to respect their focus time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

