"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface SearchExplanationProps {
  explanation: string;
}

export function SearchExplanation({ explanation }: SearchExplanationProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground leading-relaxed">{explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}

