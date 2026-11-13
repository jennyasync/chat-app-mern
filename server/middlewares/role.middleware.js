import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../utils/constants.js';

// Must run after protect so req.user is set.
export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== ROLES.ADMIN) {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
};
