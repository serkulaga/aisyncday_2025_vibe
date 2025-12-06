"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ParticipantFilters } from "@/components/participants/participant-filters";
import { useEffect, useState, useTransition } from "react";
// Fetch skills from API route since client components can't use server functions
async function getAllSkills(): Promise<string[]> {
  const response = await fetch("/api/skills");
  if (!response.ok) {
    throw new Error("Failed to fetch skills");
  }
  return response.json();
}
import type { ParticipantFilters as Filters } from "@/lib/supabase/filters";

export function ClientFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const filters: Filters = {
    search: searchParams.get("search") || undefined,
    skill: searchParams.get("skill") || undefined,
  };

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => res.json())
      .then((skills: string[]) => {
        setAvailableSkills(skills);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch skills:", error);
        setLoading(false);
      });
  }, []);

  const handleFiltersChange = (newFilters: Filters) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.skill) params.set("skill", newFilters.skill);
      router.push(`/participants?${params.toString()}`);
    });
  };

  if (loading) {
    return (
      <div className="h-20 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading filters...</p>
      </div>
    );
  }

  return (
    <ParticipantFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      availableSkills={availableSkills}
    />
  );
}

