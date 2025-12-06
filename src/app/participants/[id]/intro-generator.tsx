"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lightbulb, Loader2, Copy, Check, AlertCircle } from "lucide-react";
import { generateIntro } from "./actions";
import { getAllParticipantsClient } from "@/lib/supabase/participants-client";
import type { Participant } from "@/types";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface IntroGeneratorProps {
  sourceParticipantId: number;
  sourceParticipantName: string;
}

export function IntroGenerator({
  sourceParticipantId,
  sourceParticipantName,
}: IntroGeneratorProps) {
  const [mode, setMode] = useState<"participant" | "description">("participant");
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
  const [targetDescription, setTargetDescription] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [introMessage, setIntroMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingParticipants, setLoadingParticipants] = useState(true);

  // Load participants for dropdown
  useEffect(() => {
    async function loadParticipants() {
      try {
        const { data } = await getAllParticipantsClient({ limit: 100 });
        // Filter out the source participant
        const filtered = data.filter((p) => p.id !== sourceParticipantId);
        setParticipants(filtered);
      } catch (err) {
        console.error("Failed to load participants:", err);
      } finally {
        setLoadingParticipants(false);
      }
    }

    if (mode === "participant") {
      loadParticipants();
    }
  }, [mode, sourceParticipantId]);

  const handleGenerate = () => {
    if (mode === "participant" && !selectedParticipantId) {
      setError("Please select a participant");
      return;
    }

    if (mode === "description" && !targetDescription.trim()) {
      setError("Please enter a description of the target audience");
      return;
    }

    setError("");
    setIntroMessage("");
    setCopied(false);

    startTransition(async () => {
      try {
        const result = await generateIntro({
          sourceParticipantId,
          targetParticipantId:
            mode === "participant"
              ? parseInt(selectedParticipantId, 10)
              : undefined,
          targetDescription:
            mode === "description" ? targetDescription.trim() : undefined,
        });

        if (result.success) {
          setIntroMessage(result.message);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate intro"
        );
      }
    });
  };

  const handleCopy = async () => {
    if (!introMessage) return;

    try {
      await navigator.clipboard.writeText(introMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const canGenerate =
    (mode === "participant" && selectedParticipantId) ||
    (mode === "description" && targetDescription.trim().length > 0);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
          <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
          Intro Generator
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Generate a personalized introduction message for {sourceParticipantName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Selection */}
        <div className="space-y-2">
          <Label>Introduction Target</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "participant" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("participant");
                setError("");
                setIntroMessage("");
              }}
            >
              Select Participant
            </Button>
            <Button
              type="button"
              variant={mode === "description" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("description");
                setError("");
                setIntroMessage("");
              }}
            >
              Describe Audience
            </Button>
          </div>
        </div>

        {/* Participant Selection */}
        {mode === "participant" && (
          <div className="space-y-2">
            <Label htmlFor="target-participant">Select Participant</Label>
            <Select
              value={selectedParticipantId}
              onValueChange={(value) => {
                setSelectedParticipantId(value);
                setError("");
                setIntroMessage("");
              }}
              disabled={loadingParticipants || isPending}
            >
              <SelectTrigger id="target-participant">
                <SelectValue placeholder="Choose a participant..." />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Description Input */}
        {mode === "description" && (
          <div className="space-y-2">
            <Label htmlFor="target-description">
              Describe Target Audience
            </Label>
            <Textarea
              id="target-description"
              placeholder="e.g., 'Developers interested in AI and machine learning' or 'Startup founders looking for technical co-founders'"
              value={targetDescription}
              onChange={(e) => {
                setTargetDescription(e.target.value);
                setError("");
                setIntroMessage("");
              }}
              disabled={isPending}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Describe who {sourceParticipantName} should be introduced to
            </p>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4 mr-2" />
              Generate Intro Message
            </>
          )}
        </Button>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Generated Message */}
        {introMessage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated Message</Label>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="p-4 bg-background border rounded-lg">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {introMessage}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Copy this message to paste into Telegram, LinkedIn, or other messaging platforms
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

