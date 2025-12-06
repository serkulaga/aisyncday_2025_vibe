import { RouletteManager } from "./roulette-manager";
import { getAllParticipants } from "@/lib/supabase/participants";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Force dynamic rendering since we fetch data from Supabase
export const dynamic = 'force-dynamic';

async function RoulettePageContent() {
  // Fetch all participants for matching (server-side)
  const { data: participants } = await getAllParticipants({ limit: 100 });

  return <RouletteManager participants={participants} />;
}

export default function RoulettePage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Coffee Break Roulette</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Discover serendipitous connections during coffee breaks
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        }
      >
        <RoulettePageContent />
      </Suspense>
    </div>
  );
}
