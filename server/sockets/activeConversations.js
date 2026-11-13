// Which users have a chat open right now, so we can skip notifications for it (room membership can't tell us).
// A count, not a boolean, so closing one of two tabs doesn't clear it.
const viewers = new Map();

const key = (conversationId, userId) => `${conversationId}:${userId}`;

export const addActiveViewer = (conversationId, userId) => {
  const k = key(String(conversationId), String(userId));
  const current = viewers.get(k) ?? 0;
  const next = current + 1;
  viewers.set(k, next);
  return next;
};

// Never goes below zero, so a double close can't leave notifications muted.
export const removeActiveViewer = (conversationId, userId) => {
  const k = key(String(conversationId), String(userId));
  const current = viewers.get(k) ?? 0;
  if (current <= 1) {
    viewers.delete(k);
    return 0;
  }
  const next = current - 1;
  viewers.set(k, next);
  return next;
};

export const isUserActiveInConversation = (conversationId, userId) =>
  (viewers.get(key(String(conversationId), String(userId))) ?? 0) > 0;

export const clearActiveForSocket = (socket) => {
  const userId = socket?.user?._id;
  const activeId = socket?.data?.activeConversationId;
  if (!userId || !activeId) return;
  removeActiveViewer(activeId, userId);
  socket.data.activeConversationId = null;
};
