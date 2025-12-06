import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3x3 } from "lucide-react";

export default function ExchangePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Skill Exchange Board</h1>
        <p className="text-muted-foreground">
          See who can help with what, and who needs help
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            Exchange Network
          </CardTitle>
          <CardDescription>
            Visual board of skills and needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This board shows:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>What each person can help with</li>
            <li>What each person needs help with</li>
            <li>Potential skill exchanges and matches</li>
            <li>Visual connections between participants</li>
          </ul>
          <p className="text-sm text-muted-foreground pt-4">
            Coming soon: Interactive skill board, filters, matching visualization, and participant cards.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

