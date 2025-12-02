import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { StatusCodes } from 'http-status-codes';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_WINDOW_REQUEST_COUNT = 10;
const WINDOW_LOG_INTERVAL_IN_SECONDS = 1;

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    try {
        const currentWindow = Math.floor(Date.now() / 1000 / WINDOW_SIZE_IN_SECONDS);
        const key = `rate_limit:${ip}:${currentWindow}`;

        const requests = await redis.incr(key);

        if (requests === 1) {
            await redis.expire(key, WINDOW_SIZE_IN_SECONDS);
        }

        if (requests > MAX_WINDOW_REQUEST_COUNT) {
            res.status(StatusCodes.TOO_MANY_REQUESTS).json({
                error: 'Too many requests',
                message: 'You have exceeded the rate limit. Please try again later.'
            });
            return;
        }

        next();
    } catch (error) {
        console.error('Rate limiter error:', error);
        next(); // Allow request if redis fails, fail open
    }
};
