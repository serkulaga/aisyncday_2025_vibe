import { SearchInterface } from "./search-interface";

export default function SearchPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Agentic Search</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Ask natural language questions to find participants by skills, interests, and needs
        </p>
      </div>

      <SearchInterface />
    </div>
  );
}
