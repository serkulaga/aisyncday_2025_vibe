"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertCircle, Sparkles, Send } from "lucide-react";
import { searchParticipants } from "./actions";
import type { SearchResult, ParticipantMatch } from "@/lib/search/types";
import { isSearchError } from "@/lib/search/types";
import { SearchResultCard } from "./search-result-card";
import { SearchExplanation } from "./search-explanation";
import { cn } from "@/lib/utils";

interface SearchMessage {
  id: string;
  query: string;
  result: SearchResult;
  timestamp: Date;
}

export function SearchInterface() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = async () => {
    if (!query.trim() || isPending) return;

    const currentQuery = query.trim();
    setQuery(""); // Clear input immediately

    // Add user query to messages (optimistic)
    const messageId = `msg-${Date.now()}`;
    const tempMessage: SearchMessage = {
      id: messageId,
      query: currentQuery,
      result: {
        error: "Searching...",
        code: "SEARCH_FAILED",
        details: "",
      },
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    startTransition(async () => {
      try {
        const result = await searchParticipants(currentQuery, {
          limit: 10,
          excludeRedStatus: false,
          matchThreshold: 0.3, // Lower threshold for better recall
          includeDebug: false,
        });

        // Update message with result
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, result } : msg
          )
        );
      } catch (error) {
        // Handle unexpected errors
        const errorResult: SearchResult = {
          error: "An unexpected error occurred",
          code: "SEARCH_FAILED",
          details:
            error instanceof Error ? error.message : "Unknown error",
        };
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, result: errorResult } : msg
          )
        );
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const clearHistory = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)] max-h-[800px]">
      {/* Messages Area */}
      <Card className="flex-1 flex flex-col min-h-0 mb-4">
        <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4 text-muted-foreground">
              <Search className="h-10 w-10 sm:h-12 sm:w-12 opacity-50" />
              <div>
                <p className="text-base sm:text-lg font-medium mb-2">Start searching</p>
                <p className="text-xs sm:text-sm">
                  Try queries like:
                  <br className="hidden sm:block" />
                  <span className="block sm:inline">"Who here knows Rust and likes hiking?"</span>
                  <br className="hidden sm:block" />
                  <span className="block sm:inline">"Show me people who can help with fundraising"</span>
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-4">
                {/* User Query */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Search className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{message.query}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Search Result */}
                <div className="ml-11 space-y-4">
                  {isSearchError(message.result) ? (
                    <ErrorMessage error={message.result} />
                  ) : ("error" in message.result && message.result.error === "Searching...") ? (
                    <LoadingState />
                  ) : (
                    <>
                      <SearchExplanation explanation={message.result.explanation} />
                      {message.result.participants.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">
                            Found {message.result.participants.length} participant
                            {message.result.participants.length !== 1 ? "s" : ""}
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {message.result.participants.map((match) => (
                              <SearchResultCard
                                key={match.participant.id}
                                match={match}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No participants matched your query.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question... (e.g., 'Who knows Python?')"
            disabled={isPending}
            className="pr-10"
          />
          {isPending && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Button
          onClick={handleSearch}
          disabled={!query.trim() || isPending}
          size="lg"
          className="min-w-[100px]"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Ask
            </>
          )}
        </Button>
        {messages.length > 0 && (
          <Button
            onClick={clearHistory}
            variant="outline"
            size="lg"
            disabled={isPending}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Searching...</span>
    </div>
  );
}

function ErrorMessage({ error }: { error: { error: string; code: string; details?: string } }) {
  const isNoEmbeddings = error.code === "NO_EMBEDDINGS_AVAILABLE";
  const isInvalidQuery = error.code === "INVALID_QUERY";

  return (
    <Card className={cn("border-red-200 dark:border-red-900/50")}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              {isNoEmbeddings
                ? "Embeddings Not Available"
                : isInvalidQuery
                ? "Invalid Query"
                : "Search Failed"}
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {isNoEmbeddings
                ? "Please run the embedding generation script first to enable search."
                : error.error}
            </p>
            {error.details && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {error.details}
              </p>
            )}
            {isNoEmbeddings && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                Run: <code className="font-mono">npx tsx scripts/generate-embeddings.ts</code>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

