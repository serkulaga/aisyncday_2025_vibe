"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          <Select
            value={filters.skill || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                skill: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger id="skill">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All skills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All skills</SelectItem>
              {availableSkills.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

