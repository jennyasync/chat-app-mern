import mongoSanitize from 'express-mongo-sanitize';

// Skips req.query: it's read-only in Express 5 and validators cover query params.
export const sanitizeRequest = (req, _res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
};
