import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Activity } from "lucide-react";
import { getDashboardStats } from "@/lib/supabase/stats";

// Force dynamic rendering since we fetch data from Supabase
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch real data from Supabase
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Community OS
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl">
          Transform passive guest lists into an active, searchable network
        </p>
      </div>

      {/* Event Description */}
      <Card>
        <CardHeader>
          <CardTitle>AI Sync Day 2025 - TechSapiens</CardTitle>
          <CardDescription>
            Welcome to the Community OS for AI Sync Day 2025
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This platform transforms traditional event participant lists into an intelligent, 
            searchable network. Find people with specific skills, check real-time availability 
            status, discover serendipitous connections through our matching algorithm, and 
            explore skill exchanges.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            <div className="space-y-2 p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="text-lg">🔍</span>
                Agentic Search
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ask natural language questions to find the perfect connections
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="text-lg">🚦</span>
                Status Traffic Light
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                See who's available, busy, or in deep work mode in real-time
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors sm:col-span-2 lg:col-span-1">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="text-lg">🎲</span>
                Coffee Break Roulette
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get matched with interesting people based on non-obvious connections
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Participants"
          value={stats.totalParticipants.toString()}
          description="Registered community members"
          icon={Users}
        />
        <StatsCard
          title="Active (Green)"
          value={stats.statusCounts.green.toString()}
          description="Available to connect"
          icon={Activity}
          variant="green"
        />
        <StatsCard
          title="Maybe (Yellow)"
          value={stats.statusCounts.yellow.toString()}
          description="Selectively available"
          icon={Activity}
          variant="yellow"
        />
        <StatsCard
          title="Deep Work (Red)"
          value={stats.statusCounts.red.toString()}
          description="Not available"
          icon={Activity}
          variant="red"
        />
      </div>

      {/* Top Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Skills
          </CardTitle>
          <CardDescription>
            Most common skills in the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.topSkills.length > 0 ? (
              stats.topSkills.map((skillData) => (
                <span
                  key={skillData.skill}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  title={`${skillData.count} participant(s)`}
                >
                  {skillData.skill} ({skillData.count})
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No skills data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

