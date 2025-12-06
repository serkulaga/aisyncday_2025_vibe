import { StatusManager } from "./status-manager";
import { getAllParticipants } from "@/lib/supabase/participants";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

// Force dynamic rendering since we fetch data from Supabase
export const dynamic = 'force-dynamic';

async function StatusPageContent() {
  // Fetch all participants for the dropdown (server-side)
  const { data: participants } = await getAllParticipants({ limit: 100 });

  return <StatusManager participants={participants} />;
}

export default function StatusPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Social Anxiety Traffic Light</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Update your availability status in real-time
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
        <StatusPageContent />
      </Suspense>
    </div>
  );
}
