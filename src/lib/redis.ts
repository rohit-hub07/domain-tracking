import Redis from "ioredis";

const globalForRedis = global as unknown as {redis: Redis}

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}

export const redis =
  globalForRedis.redis || new Redis(process.env.REDIS_URL);

if(process.env.NODE_ENV !== "production"){
  globalForRedis.redis = redis;
}