// lib/redis.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const STATS_VIEW_KEY = "framebreak:stats:views";
export const STATS_VOTE_KEY = "framebreak:stats:votes";
