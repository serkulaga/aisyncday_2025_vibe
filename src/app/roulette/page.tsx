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
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          Coffee Break Roulette
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Discover serendipitous connections during coffee breaks
        </p>
      </div>
      <div className="pt-8">
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
    </div>
  );
}
