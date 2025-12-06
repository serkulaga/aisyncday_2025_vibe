"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter } from "lucide-react";
import type { ParticipantFilters } from "@/lib/supabase/filters";

interface ParticipantFiltersProps {
  filters: ParticipantFilters;
  onFiltersChange: (filters: ParticipantFilters) => void;
  availableSkills: string[];
}

export function ParticipantFilters({
  filters,
  onFiltersChange,
  availableSkills,
}: ParticipantFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search by name */}
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search by name
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name..."
              value={filters.search || ""}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value || undefined })
              }
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter by skill */}
        <div className="w-full sm:w-48">
          <Label htmlFor="skill" className="sr-only">
            Filter by skill
          </Label>
          <select
            id="skill"
            value={filters.skill || "all"}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                skill: e.target.value === "all" ? undefined : e.target.value,
              })
            }
            className="w-full h-11 rounded-lg border-2 border-gray-200 bg-gradient-to-b from-white to-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:from-white hover:to-white focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-offset-1 focus:shadow-lg"
          >
            <option value="all">All skills</option>
            {availableSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

