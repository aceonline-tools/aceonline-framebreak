// app/api/stats/route.ts
import { redis, STATS_VIEW_KEY, STATS_VOTE_KEY } from "@/lib/redis";

export const dynamic = "force-dynamic";

async function readStats(): Promise<{ viewCount: number; voteCount: number }> {
  const [rawViews, rawVotes] = await redis.mget<[number | null, number | null]>(
    STATS_VIEW_KEY,
    STATS_VOTE_KEY,
  );
  return {
    viewCount: Number(rawViews ?? 0),
    voteCount: Number(rawVotes ?? 0),
  };
}

export async function GET() {
  const stats = await readStats();
  return Response.json(stats);
}

export async function POST() {
  const updatedViewCount = await redis.incr(STATS_VIEW_KEY);
  const voteCount = Number((await redis.get<number>(STATS_VOTE_KEY)) ?? 0);
  return Response.json({ viewCount: updatedViewCount, voteCount });
}
