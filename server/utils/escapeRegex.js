// Use on any user input before it goes into a $regex query (prevents ReDoS).
export const escapeRegex = (s) =>
  String(s ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
