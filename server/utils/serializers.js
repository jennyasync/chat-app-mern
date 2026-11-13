// Shared by REST and sockets so both send the same shape.
// hiddenFor is stripped because it reveals who deleted the message for themselves.
export const serializeMessage = (doc, extras = null) => {
  if (!doc) return null;
  const obj =
    typeof doc.toObject === 'function'
      ? doc.toObject({ virtuals: false, versionKey: false })
      : { ...doc };
  delete obj.hiddenFor;
  if (extras && typeof extras === 'object') {
    Object.assign(obj, extras);
  }
  return obj;
};

export const serializePublicUser = (user) => {
  if (!user) return null;
  const obj =
    typeof user.toObject === 'function'
      ? user.toObject({ virtuals: false, versionKey: false })
      : { ...user };
  return {
    _id: String(obj._id),
    username: obj.username,
    displayName: obj.displayName,
    avatarUrl: obj.avatarUrl ?? '',
  };
};

// Allow-list of fields, so new schema fields never leak by accident.
export const serializeNotification = (doc) => {
  if (!doc) return null;
  const obj =
    typeof doc.toObject === 'function'
      ? doc.toObject({ virtuals: false, versionKey: false })
      : { ...doc };

  // actor may be populated or a bare ObjectId.
  let actor = null;
  let actorId = null;
  if (obj.actor && typeof obj.actor === 'object' && obj.actor._id) {
    actor = serializePublicUser(obj.actor);
    actorId = String(obj.actor._id);
  } else if (obj.actor) {
    actorId = String(obj.actor);
  }

  return {
    _id: String(obj._id),
    type: obj.type,
    text: obj.text,
    isRead: Boolean(obj.isRead),
    conversationId: obj.conversationId ? String(obj.conversationId) : null,
    messageId: obj.messageId ? String(obj.messageId) : null,
    actor,
    actorId,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};
