import rateLimit from 'express-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

/**
 * Rate limit middleware for API routes
 * Usage: Add at the top of your API route handler
 */
export async function applyRateLimit(req: NextRequest): Promise<boolean> {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // For now, we'll implement a simple in-memory rate limiter
  // In production, use Redis for distributed rate limiting
  const key = `${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();
  
  if (!global.rateLimitStore) {
    global.rateLimitStore = {};
  }
  
  const store = global.rateLimitStore as Record<string, number[]>;
  
  if (!store[key]) {
    store[key] = [];
  }
  
  // Clean up old entries (older than 15 minutes)
  store[key] = store[key].filter(time => now - time < 15 * 60 * 1000);
  
  if (store[key].length >= 5) {
    return false;
  }
  
  store[key].push(now);
  return true;
}
