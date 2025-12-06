import { getParticipantById } from "@/lib/supabase/participants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  MessageCircle,
  Linkedin,
  Code,
  Building2,
  Target,
  HelpCircle,
  Sparkles,
  Lightbulb,
  Activity,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  TRAFFIC_LIGHT_STATUSES,
  TRAFFIC_LIGHT_LABELS,
  TRAFFIC_LIGHT_DESCRIPTIONS,
  type TrafficLightStatus,
} from "@/lib/constants/field-mappings";
import { IntroGenerator } from "./intro-generator";

interface ParticipantPageProps {
  params: {
    id: string;
  };
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = status?.toLowerCase().trim() as TrafficLightStatus | undefined;
  const isValidStatus = normalized && TRAFFIC_LIGHT_STATUSES.includes(normalized);
  const statusType = isValidStatus ? normalized : undefined;
  
  const statusConfig = {
    green: {
      label: TRAFFIC_LIGHT_LABELS.green,
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-500",
      dot: "bg-green-500",
    },
    yellow: {
      label: TRAFFIC_LIGHT_LABELS.yellow,
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
      text: "text-yellow-700 dark:text-yellow-400",
      border: "border-yellow-500",
      dot: "bg-yellow-500",
    },
    red: {
      label: TRAFFIC_LIGHT_LABELS.red,
      bg: "bg-red-100 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-500",
      dot: "bg-red-500",
    },
    default: {
      label: "Unknown",
      bg: "bg-gray-100 dark:bg-gray-900/20",
      text: "text-gray-700 dark:text-gray-400",
      border: "border-gray-500",
      dot: "bg-gray-400",
    },
  };

  const config = statusType ? statusConfig[statusType] : statusConfig.default;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border",
        config.bg,
        config.text,
        config.border
      )}
    >
      <div className={cn("h-2 w-2 rounded-full", config.dot)} />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}

export default async function ParticipantPage({ params }: ParticipantPageProps) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    notFound();
  }

  const participant = await getParticipantById(id);

  if (!participant) {
    notFound();
  }

  const hasStartup = participant.hasStartup && participant.startupName;
  const hasCustomInterests = participant.custom_array_2 && participant.custom_array_2.length > 0;
  const hasCustomTags = participant.custom_array_5 && participant.custom_array_5.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back Button */}
      <Link href="/participants">
        <Button variant="ghost" size="sm" className="mb-2 sm:mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Back to Participants</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </Link>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Photo */}
        <div className="flex-shrink-0 self-center sm:self-start">
          {participant.photo ? (
            <img
              src={participant.photo}
              alt={participant.name}
              className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-4 border-background shadow-lg"
            />
          ) : (
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-4 border-background shadow-lg">
              <User className="h-12 w-12 sm:h-16 sm:w-16 text-primary/60" />
            </div>
          )}
        </div>

        {/* Name and Basic Info */}
        <div className="flex-1 space-y-3 sm:space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">{participant.name}</h1>
            <StatusBadge status={participant.custom_5} />
            {participant.custom_6 && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {participant.custom_6}
              </p>
            )}
          </div>

          {/* Contact Links */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {participant.telegram && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://t.me/${participant.telegram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Telegram
                </a>
              </Button>
            )}
            {participant.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={participant.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
            {participant.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${participant.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Bio */}
          {participant.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {participant.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Bio (if available) */}
          {participant.custom_1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Enhanced Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {participant.custom_1}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {participant.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {participant.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
                {/* Parsed Skills (if available) */}
                {participant.custom_array_1 && participant.custom_array_1.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Additional Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {participant.custom_array_1.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Interests */}
          {hasCustomInterests && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {participant.custom_array_2!.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Tags */}
          {hasCustomTags && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {participant.custom_array_5!.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Can Help */}
          {participant.canHelp && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Can Help With
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {participant.canHelp}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Needs Help */}
          {participant.needsHelp && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Needs Help With
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {participant.needsHelp}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Looking For */}
          {participant.lookingFor.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Looking For
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {participant.lookingFor.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Startup Info */}
          {hasStartup && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Startup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {participant.startupName && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Name</p>
                    <p className="text-sm font-medium">{participant.startupName}</p>
                  </div>
                )}
                {participant.startupStage && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Stage</p>
                    <Badge variant="outline">{participant.startupStage}</Badge>
                  </div>
                )}
                {participant.startupDescription && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm leading-relaxed">{participant.startupDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Usage */}
          {participant.aiUsage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {participant.aiUsage}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Intro Generator */}
      <IntroGenerator
        sourceParticipantId={participant.id}
        sourceParticipantName={participant.name}
      />
    </div>
  );
}

