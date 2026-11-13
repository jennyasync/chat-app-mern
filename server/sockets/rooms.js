// user room = all devices of one user, conv room = all participants of a chat.
export const userRoom = (userId) => `user:${userId}`;
export const convRoom = (conversationId) => `conv:${conversationId}`;
