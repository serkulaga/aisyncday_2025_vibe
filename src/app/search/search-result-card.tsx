"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ParticipantMatch } from "@/lib/search/types";
import {
  TRAFFIC_LIGHT_STATUSES,
  TRAFFIC_LIGHT_LABELS,
  type TrafficLightStatus,
} from "@/lib/constants/field-mappings";
import { cn } from "@/lib/utils";

interface SearchResultCardProps {
  match: ParticipantMatch;
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
  default: {
    bg: "bg-gray-100 dark:bg-gray-900/20",
    text: "text-gray-700 dark:text-gray-400",
    border: "border-gray-500",
    dot: "bg-gray-500",
  },
};

function getStatusVariant(status?: string): TrafficLightStatus | "default" {
  const normalized = status?.toLowerCase().trim();
  if (TRAFFIC_LIGHT_STATUSES.includes(normalized as TrafficLightStatus)) {
    return normalized as TrafficLightStatus;
  }
  return "default";
}

export function SearchResultCard({ match }: SearchResultCardProps) {
  const participant = match.participant;
  const status = getStatusVariant(participant.custom_5);
  const statusConfig = statusColors[status];

  // Combine skills from original and parsed skills
  const allSkills = [
    ...(participant.skills || []),
    ...(participant.custom_array_1 || []),
  ];
  const displaySkills = allSkills.slice(0, 4);
  const hasMoreSkills = allSkills.length > 4;

  // Relevance score as percentage
  const relevancePercentage = Math.round(match.relevanceScore * 100);

  return (
    <Card className="h-full hover:shadow-md hover:shadow-primary/5 transition-all duration-200 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {participant.photo ? (
              <img
                src={participant.photo}
                alt={participant.name}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover flex-shrink-0 ring-2 ring-border"
              />
            ) : (
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 ring-2 ring-border">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary/60" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-base truncate font-semibold">{participant.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0 text-xs",
                    statusConfig.bg,
                    statusConfig.text,
                    statusConfig.border
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dot)} />
                  {status === "default"
                    ? "Unknown"
                    : TRAFFIC_LIGHT_LABELS[status]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {relevancePercentage}% match
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Matched Fields Highlight */}
        {((match.matchedFields.skills?.length ?? 0) > 0 ||
          (match.matchedFields.interests?.length ?? 0) > 0) && (
          <div className="space-y-1.5">
            {match.matchedFields.skills && match.matchedFields.skills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Matched Skills:
                </p>
                <div className="flex flex-wrap gap-1">
                  {match.matchedFields.skills.slice(0, 3).map((skill, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      className="text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {match.matchedFields.interests && match.matchedFields.interests.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Matched Interests:
                </p>
                <div className="flex flex-wrap gap-1">
                  {match.matchedFields.interests.slice(0, 2).map((interest, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Skills */}
        {displaySkills.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Skills:
            </p>
            <div className="flex flex-wrap gap-1">
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
                  +{allSkills.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/participants/${participant.id}`}>
              View Profile
              <ExternalLink className="h-3 w-3 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

