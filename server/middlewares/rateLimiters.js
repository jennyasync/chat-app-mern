import rateLimit from 'express-rate-limit';

const baseOptions = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
};

const minutes = (n) => n * 60 * 1000;

export const globalLimiter = rateLimit({
  ...baseOptions,
  windowMs: minutes(15),
  max: 300,
});

// Tight limit to slow down credential stuffing.
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: minutes(15),
  max: 10,
});

// REST fallback; Socket.io is the main way messages are sent.
export const messageLimiter = rateLimit({
  ...baseOptions,
  windowMs: minutes(1),
  max: 60,
});

export const uploadLimiter = rateLimit({
  ...baseOptions,
  windowMs: minutes(10),
  max: 20,
});

export const adminLimiter = rateLimit({
  ...baseOptions,
  windowMs: minutes(15),
  max: 200,
});
