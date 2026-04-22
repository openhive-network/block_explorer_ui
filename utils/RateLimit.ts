import { LRUCache } from 'lru-cache';
import { config } from '@/Config';

interface Options {
  uniqueTokenPerInterval?: number;
  interval?: number;
}

export const rateLimit = (options?: Options) => {
  const tokenCache = new LRUCache<string, number>({
    // Fallback to config values if no specific options are provided
    max: options?.uniqueTokenPerInterval || config.security.rateLimits.maxTrackedIps,
    ttl: options?.interval || config.security.rateLimits.interval,
  });

  return {
    check: (res: any, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const currentUsage = tokenCache.get(token) || 0;
        const isRateLimited = currentUsage >= limit;

        tokenCache.set(token, currentUsage + 1);

        if (res && res.setHeader) {
          res.setHeader('X-RateLimit-Limit', limit);
          res.setHeader('X-RateLimit-Remaining', isRateLimited ? 0 : limit - (currentUsage + 1));
        }

        return isRateLimited ? reject() : resolve();
      }),
  };
};

export const loginLimiter = rateLimit();
export const broadcastLimiter = rateLimit();