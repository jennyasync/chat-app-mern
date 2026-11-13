// userId -> Set of socket ids. A user with several tabs stays online until the last one disconnects.
// shortcut: in-memory, so it only works with a single server process; move to Redis to scale out.
const userSockets = new Map();

const toKey = (userId) => String(userId);

export const addUserSocket = (userId, socketId) => {
  const key = toKey(userId);
  let set = userSockets.get(key);
  if (!set) {
    set = new Set();
    userSockets.set(key, set);
  }
  set.add(socketId);
  return set.size;
};

// Returns how many sockets the user still has; 0 means they just went offline.
export const removeUserSocket = (userId, socketId) => {
  const key = toKey(userId);
  const set = userSockets.get(key);
  if (!set) return 0;
  set.delete(socketId);
  if (set.size === 0) {
    userSockets.delete(key);
    return 0;
  }
  return set.size;
};

export const isUserOnline = (userId) => userSockets.has(toKey(userId));
