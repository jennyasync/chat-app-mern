import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { ApiError } from './apiError.js';
import { CONVERSATION_TYPES } from './constants.js';

const { Types } = mongoose;

// Accepts a string, ObjectId or populated doc.
const toIdString = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Types.ObjectId) return value.toString();
  if (value._id) return value._id.toString();
  return null;
};

const isValidObjectId = (value) =>
  typeof value === 'string' && Types.ObjectId.isValid(value) && /^[a-f0-9]{24}$/i.test(value);

export const findOrCreateDirectConversation = async (userAId, userBId) => {
  const a = toIdString(userAId);
  const b = toIdString(userBId);

  if (!a || !b) throw ApiError.badRequest('Invalid user id');
  if (a === b) throw ApiError.badRequest('Cannot create a direct conversation with yourself');
  if (!isValidObjectId(a) || !isValidObjectId(b)) {
    throw ApiError.badRequest('Invalid user id');
  }

  const existing = await Conversation.findOne({
    type: CONVERSATION_TYPES.DIRECT,
    participants: { $all: [a, b], $size: 2 },
  });
  if (existing) return existing;

  const [first, second] = [a, b].sort();

  try {
    const created = await Conversation.create({
      type: CONVERSATION_TYPES.DIRECT,
      participants: [first, second],
      createdBy: first,
    });
    return created;
  } catch (err) {
    // Lost a race with a parallel create, so read the winner instead of failing.
    if (err?.code === 11000) {
      const racedWinner = await Conversation.findOne({
        type: CONVERSATION_TYPES.DIRECT,
        participants: { $all: [a, b], $size: 2 },
      });
      if (racedWinner) return racedWinner;
    }
    throw err;
  }
};

export const assertParticipant = (conversation, userId) => {
  if (!conversation) throw ApiError.notFound('Conversation not found');
  const uid = toIdString(userId);
  if (!uid) throw ApiError.unauthorized('Unauthenticated');

  const isMember = conversation.participants.some(
    (p) => toIdString(p) === uid,
  );
  if (!isMember) throw ApiError.forbidden('You are not a participant of this conversation');
};

// No-op for direct chats, which have no admins.
export const assertGroupAdmin = (conversation, userId) => {
  if (!conversation) throw ApiError.notFound('Conversation not found');
  if (conversation.type !== CONVERSATION_TYPES.GROUP) return;

  const uid = toIdString(userId);
  if (!uid) throw ApiError.unauthorized('Unauthenticated');

  const isAdmin = conversation.admins.some((a) => toIdString(a) === uid);
  if (!isAdmin) throw ApiError.forbidden('Admin privileges required');
};

export const resetUnread = async (conversationId, userId) => {
  const cid = toIdString(conversationId);
  const uid = toIdString(userId);
  if (!cid || !isValidObjectId(cid)) throw ApiError.badRequest('Invalid conversation id');
  if (!uid || !isValidObjectId(uid)) throw ApiError.badRequest('Invalid user id');

  return Conversation.findByIdAndUpdate(
    cid,
    { $set: { [`unreadCounts.${uid}`]: 0 } },
    { new: true },
  );
};

// Used when an account is deleted. Each chat needs its own update, so no updateMany.
export const detachUserFromConversations = async (userId) => {
  const uid = toIdString(userId);
  if (!uid || !isValidObjectId(uid)) return;

  const conversations = await Conversation.find({ participants: uid }).select(
    'participants admins type',
  );

  await Promise.all(
    conversations.map((conv) => {
      const remaining = conv.participants
        .map((p) => String(p))
        .filter((id) => id !== uid);

      const update = {
        $pull: { participants: uid, admins: uid },
        $unset: { [`unreadCounts.${uid}`]: '' },
      };

      if (remaining.length < 2) {
        // Close it rather than leave a chat with fewer than 2 members.
        update.$set = { isActive: false };
      } else if (conv.type === CONVERSATION_TYPES.GROUP) {
        const remainingAdmins = conv.admins
          .map((a) => String(a))
          .filter((id) => id !== uid && remaining.includes(id));
        if (remainingAdmins.length === 0) {
          // Keep the group with an admin by promoting the earliest remaining member.
          update.$addToSet = { admins: remaining[0] };
        }
      }

      return Conversation.updateOne({ _id: conv._id }, update);
    }),
  );
};
