// app/components/StatsBar.tsx
"use client";

import { useEffect, useState } from "react";

const VOTE_STORAGE_KEY = "framebreak:hasVoted";

type Stats = { viewCount: number; voteCount: number };

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  useEffect(() => {
    setHasVoted(window.localStorage.getItem(VOTE_STORAGE_KEY) === "true");

    let hasBeenCancelled = false;
    const registerView = async () => {
      try {
        const response = await fetch("/api/stats", { method: "POST" });
        if (!response.ok) return;
        const data: Stats = await response.json();
        if (!hasBeenCancelled) setStats(data);
      } catch {
        // silent: stats are non-critical
      }
    };
    registerView();
    return () => {
      hasBeenCancelled = true;
    };
  }, []);

  const submitVote = async () => {
    if (hasVoted || isSubmittingVote) return;
    setIsSubmittingVote(true);
    try {
      const response = await fetch("/api/stats/vote", { method: "POST" });
      if (!response.ok) return;
      const data: { voteCount: number } = await response.json();
      setStats(previous =>
        previous ? { ...previous, voteCount: data.voteCount } : { viewCount: 0, voteCount: data.voteCount },
      );
      setHasVoted(true);
      window.localStorage.setItem(VOTE_STORAGE_KEY, "true");
    } catch {
      // silent
    } finally {
      setIsSubmittingVote(false);
    }
  };

  return (
    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
      <span>
        Lượt xem:{" "}
        <span className="font-semibold text-neutral-700 tabular-nums dark:text-neutral-200">
          {stats ? stats.viewCount.toLocaleString() : "—"}
        </span>
      </span>
      <button
        type="button"
        onClick={submitVote}
        disabled={hasVoted || isSubmittingVote}
        aria-busy={isSubmittingVote}
        className={
          "group inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
          (hasVoted
            ? "cursor-default border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
            : isSubmittingVote
              ? "cursor-wait border-neutral-300 text-neutral-400 dark:border-neutral-600 dark:text-neutral-500"
              : "cursor-pointer border-neutral-300 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800")
        }
      >
        {isSubmittingVote ? (
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-500 dark:border-neutral-600 dark:border-t-neutral-300"
          />
        ) : (
          <span
            aria-hidden="true"
            className={hasVoted ? "animate-heartbeat" : "animate-heartbeat-hover"}
          >
            {hasVoted ? "♥" : "♡"}
          </span>
        )}
        <span className="tabular-nums">{stats ? stats.voteCount.toLocaleString() : "—"}</span>
      </button>
    </div>
  );
}
