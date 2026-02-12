import { redis } from '../redis/adapter';
import { limits, shouldEnforceLimits } from './limits';

export type RateLimitWindow = 'minute' | 'hour' | 'day' | 'month';

export interface RateLimitConfig {
  perMinute?: number;
  perHour?: number;
  perDay?: number;
  perMonth?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: {
    minute: number;
    hour: number;
    day: number;
    month: number;
  };
  resetAt: {
    minute: number;
    hour: number;
    day: number;
    month: number;
  };
  exceeded?: RateLimitWindow;
}

const WINDOW_SECONDS: Record<RateLimitWindow, number> = {
  minute: 60,
  hour: 3600,
  day: 86400,
  month: 2592000, // 30 days
};

async function getWindowCount(key: string, window: RateLimitWindow): Promise<{ count: number; ttl: number }> {
  const windowKey = `ratelimit:${key}:${window}`;
  const count = await redis.incr(windowKey);
  
  if (count === 1) {
    await redis.expire(windowKey, WINDOW_SECONDS[window]);
  }
  
  const ttl = await redis.ttl(windowKey);
  return { count, ttl: ttl > 0 ? ttl : WINDOW_SECONDS[window] };
}

export async function checkRateLimits(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  if (!shouldEnforceLimits()) {
    return {
      allowed: true,
      remaining: { minute: 999, hour: 999, day: 999, month: 999 },
      resetAt: { minute: 0, hour: 0, day: 0, month: 0 },
    };
  }

  const now = Date.now();
  const results: Record<RateLimitWindow, { count: number; ttl: number }> = {
    minute: { count: 0, ttl: 60 },
    hour: { count: 0, ttl: 3600 },
    day: { count: 0, ttl: 86400 },
    month: { count: 0, ttl: 2592000 },
  };

  if (config.perMinute) {
    results.minute = await getWindowCount(identifier, 'minute');
  }
  if (config.perHour) {
    results.hour = await getWindowCount(identifier, 'hour');
  }
  if (config.perDay) {
    results.day = await getWindowCount(identifier, 'day');
  }
  if (config.perMonth) {
    results.month = await getWindowCount(identifier, 'month');
  }

  let exceeded: RateLimitWindow | undefined;
  
  if (config.perMinute && results.minute.count > config.perMinute) {
    exceeded = 'minute';
  } else if (config.perHour && results.hour.count > config.perHour) {
    exceeded = 'hour';
  } else if (config.perDay && results.day.count > config.perDay) {
    exceeded = 'day';
  } else if (config.perMonth && results.month.count > config.perMonth) {
    exceeded = 'month';
  }

  return {
    allowed: !exceeded,
    exceeded,
    remaining: {
      minute: Math.max(0, (config.perMinute || 999) - results.minute.count),
      hour: Math.max(0, (config.perHour || 999) - results.hour.count),
      day: Math.max(0, (config.perDay || 999) - results.day.count),
      month: Math.max(0, (config.perMonth || 999) - results.month.count),
    },
    resetAt: {
      minute: now + results.minute.ttl * 1000,
      hour: now + results.hour.ttl * 1000,
      day: now + results.day.ttl * 1000,
      month: now + results.month.ttl * 1000,
    },
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining-Minute': result.remaining.minute.toString(),
    'X-RateLimit-Remaining-Hour': result.remaining.hour.toString(),
    'X-RateLimit-Remaining-Day': result.remaining.day.toString(),
    'X-RateLimit-Remaining-Month': result.remaining.month.toString(),
  };
}

export const renderLimits: RateLimitConfig = {
  perMinute: limits.render.perMinute,
  perHour: limits.render.perHour,
  perDay: limits.render.perDay,
};

export const aiGenerateLimits: RateLimitConfig = {
  perMinute: limits.ai.generate.perMinute,
  perDay: limits.ai.generate.perDay,
  perMonth: limits.ai.generate.perMonth,
};

export const aiEditLimits: RateLimitConfig = {
  perMinute: limits.ai.edit.perMinute,
  perDay: limits.ai.edit.perDay,
  perMonth: limits.ai.edit.perMonth,
};
