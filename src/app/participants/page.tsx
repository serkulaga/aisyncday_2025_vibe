import { ParticipantCard } from "@/components/participants/participant-card";
import { ClientFilters } from "./client-filters";
import { getParticipantsWithFilters } from "@/lib/supabase/filters";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Suspense } from "react";

interface ParticipantsPageProps {
  searchParams: {
    search?: string;
    skill?: string;
  };
}

async function ParticipantsList({
  search,
  skill,
}: {
  search?: string;
  skill?: string;
}) {
  const filters = {
    search,
    skill,
  };

  const participants = await getParticipantsWithFilters(filters, 100);

  return (
    <>
      <ClientFilters />

      {participants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No participants found matching your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {participants.length} participant{participants.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {participants.map((participant) => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default async function ParticipantsPage({ searchParams }: ParticipantsPageProps) {
  const { search, skill } = searchParams;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Participants</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Browse all community members and their profiles
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading participants...</p>
            </CardContent>
          </Card>
        }
      >
        <ParticipantsList search={search} skill={skill} />
      </Suspense>
    </div>
  );
}
