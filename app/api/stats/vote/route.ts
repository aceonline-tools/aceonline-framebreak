// app/api/stats/vote/route.ts
import { redis, STATS_VOTE_KEY } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST() {
  const updatedVoteCount = await redis.incr(STATS_VOTE_KEY);
  return Response.json({ voteCount: updatedVoteCount });
}
