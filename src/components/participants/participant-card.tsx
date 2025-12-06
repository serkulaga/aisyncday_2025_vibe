import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Participant } from "@/types";
import Link from "next/link";
import { Activity, User } from "lucide-react";
import {
  TRAFFIC_LIGHT_STATUSES,
  TRAFFIC_LIGHT_LABELS,
  type TrafficLightStatus,
} from "@/lib/constants/field-mappings";

interface ParticipantCardProps {
  participant: Participant;
}

const statusColors = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  default: "bg-gray-400",
};


function getStatusVariant(status?: string): TrafficLightStatus | "default" {
  const normalized = status?.toLowerCase().trim();
  if (TRAFFIC_LIGHT_STATUSES.includes(normalized as TrafficLightStatus)) {
    return normalized as TrafficLightStatus;
  }
  return "default";
}

export function ParticipantCard({ participant }: ParticipantCardProps) {
  const status = getStatusVariant(participant.custom_5);
  const initials = participant.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Bio snippet (first 150 characters)
  const bioSnippet = participant.bio
    ? participant.bio.length > 150
      ? participant.bio.substring(0, 150) + "..."
      : participant.bio
    : "No bio available";

  // Show first 5 skills
  const displaySkills = participant.skills.slice(0, 5);
  const hasMoreSkills = participant.skills.length > 5;

  return (
    <Link href={`/participants/${participant.id}`} className="block group">
      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {participant.photo ? (
                <img
                  src={participant.photo}
                  alt={participant.name}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover flex-shrink-0 ring-2 ring-border"
                />
              ) : (
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 ring-2 ring-border">
                  <User className="h-6 w-6 sm:h-7 sm:w-7 text-primary/60" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg truncate font-semibold">{participant.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      statusColors[status]
                    )}
                  />
                  <span className="text-xs">
                    {status === "default" ? "Unknown" : TRAFFIC_LIGHT_LABELS[status]}
                  </span>
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Bio Snippet */}
          <p className="text-sm text-muted-foreground line-clamp-2">{bioSnippet}</p>

          {/* Skills */}
          {displaySkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {displaySkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs"
                >
                  {skill}
                </Badge>
              ))}
              {hasMoreSkills && (
                <Badge variant="outline" className="text-xs">
                  +{participant.skills.length - 5} more
                </Badge>
              )}
            </div>
          )}

          {/* Availability text if available */}
          {participant.custom_6 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <Activity className="h-3 w-3 inline mr-1" />
                {participant.custom_6}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

