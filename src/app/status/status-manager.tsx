"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
  TRAFFIC_LIGHT_STATUSES,
  TRAFFIC_LIGHT_LABELS,
  TRAFFIC_LIGHT_DESCRIPTIONS,
  DEFAULT_AVAILABILITY_OPTIONS,
  type TrafficLightStatus,
} from "@/lib/constants/field-mappings";
import { getCurrentParticipantId, setCurrentParticipantId } from "@/lib/utils/storage";
import { getParticipantByIdClient, updateTrafficLightStatusClient } from "@/lib/supabase/participants-client";
import type { Participant } from "@/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster-provider";

interface StatusManagerProps {
  participants: Participant[];
}

const statusColors = {
  green: {
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-500",
    dot: "bg-green-500",
  },
  yellow: {
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-500",
    dot: "bg-yellow-500",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-500",
    dot: "bg-red-500",
  },
};

export function StatusManager({ participants }: StatusManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [status, setStatus] = useState<TrafficLightStatus>("green");
  const [availabilityText, setAvailabilityText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
            const currentStatus = (participant.custom_5?.toLowerCase().trim() ||
              "green") as TrafficLightStatus;
            setStatus(
              TRAFFIC_LIGHT_STATUSES.includes(currentStatus) ? currentStatus : "green"
            );
            setAvailabilityText(participant.custom_6 || "");
          }
        })
        .catch((error) => {
          console.error("Failed to load participant:", error);
          toast({
            title: "Error",
            description: "Failed to load participant data",
            variant: "destructive",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedParticipantId, toast]);

  const handleParticipantChange = (participantId: string) => {
    const id = parseInt(participantId, 10);
    if (!isNaN(id)) {
      setSelectedParticipantId(id);
      setCurrentParticipantId(id);
    }
  };

  const handleStatusChange = (newStatus: TrafficLightStatus) => {
    setStatus(newStatus);
    // Update availability text to default for the status if empty
    if (!availabilityText && DEFAULT_AVAILABILITY_OPTIONS[newStatus].length > 0) {
      setAvailabilityText(DEFAULT_AVAILABILITY_OPTIONS[newStatus][0]);
    }
  };

  const handleSave = async () => {
    if (!selectedParticipantId || !currentParticipant) return;

    setSaving(true);
    try {
      await updateTrafficLightStatusClient(selectedParticipantId, {
        status,
        availabilityText: availabilityText.trim() || undefined,
      });

      toast({
        title: "Status Updated",
        description: "Your availability status has been updated successfully.",
      });

      // Refresh the page data
      startTransition(() => {
        router.refresh();
      });

      // Reload participant to reflect changes
      const updated = await getParticipantByIdClient(selectedParticipantId);
      if (updated) {
        setCurrentParticipant(updated);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const currentStatusConfig = statusColors[status];

  if (participants.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No participants found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Participant Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Participant</CardTitle>
          <CardDescription>
            Choose which participant you are to manage your status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="participant-select">Participant</Label>
            <Select
              value={selectedParticipantId?.toString() || ""}
              onValueChange={handleParticipantChange}
              disabled={loading}
            >
              <SelectTrigger id="participant-select">
                <SelectValue placeholder="Select a participant" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Your selection will be saved for future visits
            </p>
          </div>
        </CardContent>
      </Card>

      {loading && selectedParticipantId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-4">Loading participant data...</p>
          </CardContent>
        </Card>
      ) : currentParticipant ? (
        <>
          {/* Current Status Display */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
              <CardDescription>Your current availability status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg border-2",
                    currentStatusConfig.bg,
                    currentStatusConfig.border
                  )}
                >
                  <div
                    className={cn("h-4 w-4 rounded-full", currentStatusConfig.dot)}
                  />
                  <div>
                    <p className={cn("font-semibold", currentStatusConfig.text)}>
                      {TRAFFIC_LIGHT_LABELS[status]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {TRAFFIC_LIGHT_DESCRIPTIONS[status]}
                    </p>
                  </div>
                </div>
              </div>
              {availabilityText && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <Activity className="h-4 w-4 inline mr-2" />
                    {availabilityText}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>
                Choose your availability status for other participants to see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Buttons */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TRAFFIC_LIGHT_STATUSES.map((s) => {
                    const config = statusColors[s];
                    return (
                      <Button
                        key={s}
                        variant={status === s ? "default" : "outline"}
                        className={cn(
                          "h-auto py-4 flex flex-col items-center gap-2",
                          status === s && config.bg
                        )}
                        onClick={() => handleStatusChange(s)}
                      >
                        <div className={cn("h-3 w-3 rounded-full", config.dot)} />
                        <div className="text-center">
                          <p className="font-semibold">{TRAFFIC_LIGHT_LABELS[s]}</p>
                          <p className="text-xs opacity-70">
                            {TRAFFIC_LIGHT_DESCRIPTIONS[s]}
                          </p>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Availability Text */}
              <div className="space-y-2">
                <Label htmlFor="availability-text">Availability Message (Optional)</Label>
                <Input
                  id="availability-text"
                  placeholder="e.g., 'Available for coffee chats' or 'In deep work until 3pm'"
                  value={availabilityText}
                  onChange={(e) => setAvailabilityText(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Add a custom message to clarify your availability
                </p>
              </div>

              {/* Quick Suggestions */}
              {DEFAULT_AVAILABILITY_OPTIONS[status].length > 0 && (
                <div className="space-y-2">
                  <Label>Quick Suggestions</Label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_AVAILABILITY_OPTIONS[status].map((option, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => setAvailabilityText(option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving || isPending}
                className="w-full sm:w-auto"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Status Overview Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {TRAFFIC_LIGHT_STATUSES.map((s) => {
              const config = statusColors[s];
              const count = participants.filter(
                (p) => p.custom_5?.toLowerCase().trim() === s
              ).length;
              return (
                <Card key={s} className={cn("border-2", status === s && config.border)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {TRAFFIC_LIGHT_LABELS[s]}
                      </CardTitle>
                      <div className={cn("h-3 w-3 rounded-full", config.dot)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">
                      participant{count !== 1 ? "s" : ""} {s === status && "(you)"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Please select a participant to manage their status.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

