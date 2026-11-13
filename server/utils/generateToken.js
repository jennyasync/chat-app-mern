import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Only the id goes in the token, so role and status are always read fresh from the DB.
export const generateToken = (userId) =>
  jwt.sign({ id: String(userId) }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
