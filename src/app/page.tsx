import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Search, Shuffle } from "lucide-react";
import { getDashboardStats } from "@/lib/supabase/stats";
import { cn } from "@/lib/utils";

// Force dynamic rendering since we fetch data from Supabase
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch real data from Supabase
  const stats = await getDashboardStats();

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          Community OS
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Transform passive guest lists into an active, searchable network
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-sm text-gray-500">AI Sync Day 2025 - TechSapiens</span>
        </div>
      </div>

      <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0 pt-8">
        <div className="prose max-w-none pb-8 pt-8 dark:prose-invert xl:col-span-2">
          <p className="text-base leading-7 text-gray-600 dark:text-gray-400">
            This platform transforms traditional event participant lists into an intelligent, 
            searchable network. Find people with specific skills and discover serendipitous 
            connections through our matching algorithm.
          </p>
        </div>
        <div className="top-6 xl:sticky">
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Features
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Search className="mt-1 h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Agentic Search</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ask natural language questions to find connections
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shuffle className="mt-1 h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Coffee Break Roulette</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get matched based on non-obvious connections
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 pt-8">
        <div className="space-y-2 pb-8">
          <h2 className="text-2xl font-bold leading-8 tracking-tight">Statistics</h2>
          <div className="mt-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalParticipants}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Registered participants
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 pb-8 pt-8">
          <h2 className="text-2xl font-bold leading-8 tracking-tight">Top Skills</h2>
          <p className="text-base leading-7 text-gray-500 dark:text-gray-400">
            Most common skills in the community
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {stats.topSkills.length > 0 ? (
              stats.topSkills.map((skillData) => (
                <span
                  key={skillData.skill}
                  className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  title={`${skillData.count} participant(s)`}
                >
                  {skillData.skill} <span className="ml-2 text-gray-500">({skillData.count})</span>
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No skills data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

