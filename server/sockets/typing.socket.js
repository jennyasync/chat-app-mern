import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { convRoom, userRoom } from './rooms.js';

const { Types } = mongoose;

const TYPING_THROTTLE_MS = 2000;
// Send typing:stop ourselves if the client goes quiet.
const TYPING_AUTO_STOP_MS = 5000;

// "conversationId:userId" -> { lastBroadcastAt, autoStopTimer }
const typingState = new Map();

const stateKey = (conversationId, userId) => `${conversationId}:${userId}`;

const isValidObjectId = (value) =>
  typeof value === 'string' &&
  /^[a-f0-9]{24}$/i.test(value) &&
  Types.ObjectId.isValid(value);

const clearEntry = (key) => {
  const entry = typingState.get(key);
  if (entry?.autoStopTimer) clearTimeout(entry.autoStopTimer);
  typingState.delete(key);
};

// Called when the user's last socket disconnects, so the indicator doesn't get stuck.
export const clearTypingForUser = (io, userId) => {
  const suffix = `:${String(userId)}`;
  for (const key of typingState.keys()) {
    if (!key.endsWith(suffix)) continue;
    const conversationId = key.slice(0, key.length - suffix.length);
    clearEntry(key);
    io.to(convRoom(conversationId))
      .except(userRoom(userId))
      .emit('typing:stop', { conversationId, userId: String(userId) });
  }
};

// Checks membership on every event so a user removed from a group can't keep sending typing events.
const validateTypingPayload = async (payload, userId) => {
  if (!payload || typeof payload !== 'object') return null;
  const { conversationId } = payload;
  if (!isValidObjectId(conversationId)) return null;

  const conversation = await Conversation.findOne(
    { _id: conversationId, participants: userId, isActive: true },
    '_id',
  ).lean();

  return conversation ? conversationId : null;
};

export const registerTypingHandlers = (io, socket) => {
  const userId = String(socket.user._id);

  socket.on('typing:start', async (payload) => {
    try {
      const conversationId = await validateTypingPayload(payload, userId);
      if (!conversationId) return;

      const key = stateKey(conversationId, userId);
      const now = Date.now();
      const existing = typingState.get(key);

      if (existing?.autoStopTimer) clearTimeout(existing.autoStopTimer);

      const autoStopTimer = setTimeout(() => {
        clearEntry(key);
        io.to(convRoom(conversationId))
          .except(userRoom(userId))
          .emit('typing:stop', { conversationId, userId });
      }, TYPING_AUTO_STOP_MS);

      // Throttled: keep the new timer but don't broadcast again yet.
      if (existing && now - existing.lastBroadcastAt < TYPING_THROTTLE_MS) {
        typingState.set(key, {
          lastBroadcastAt: existing.lastBroadcastAt,
          autoStopTimer,
        });
        return;
      }

      typingState.set(key, { lastBroadcastAt: now, autoStopTimer });

      io.to(convRoom(conversationId))
        .except(userRoom(userId))
        .emit('typing:start', { conversationId, userId });
    } catch {
      // Typing is best effort.
    }
  });

  socket.on('typing:stop', async (payload) => {
    try {
      const conversationId = await validateTypingPayload(payload, userId);
      if (!conversationId) return;

      const key = stateKey(conversationId, userId);
      const hadEntry = typingState.has(key);
      clearEntry(key);

      // Skip no-op stops, e.g. from a composer blur when the user wasn't typing.
      if (hadEntry) {
        io.to(convRoom(conversationId))
          .except(userRoom(userId))
          .emit('typing:stop', { conversationId, userId });
      }
    } catch {
      // Typing is best effort.
    }
  });
};
