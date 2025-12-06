import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserX, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <UserX className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Participant Not Found</CardTitle>
          <CardDescription>
            The participant you're looking for doesn't exist or has been removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/participants">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Participants
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

