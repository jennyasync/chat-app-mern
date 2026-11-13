import { isProduction } from '../config/env.js';
import { Conversation } from '../models/Conversation.js';
import { User } from '../models/User.js';
import { socketAuthMiddleware } from './auth.socket.js';
import {
  addUserSocket,
  removeUserSocket,
} from './onlineUsers.js';
import {
  broadcastUserOffline,
  broadcastUserOnline,
  getShowOnlineStatus,
  registerPresenceHandlers,
} from './presence.socket.js';
import {
  clearTypingForUser,
  registerTypingHandlers,
} from './typing.socket.js';
import { registerMessageHandlers } from './message.socket.js';
import { clearActiveForSocket } from './activeConversations.js';
import { convRoom, userRoom } from './rooms.js';

// Rooms are only joined from DB lookups, never from a room name the client sends.
export const registerSocketHandlers = (io) => {
  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    const userId = socket.user._id;

    try {
      addUserSocket(userId, socket.id);

      socket.join(userRoom(userId));

      const conversations = await Conversation.find(
        { participants: userId, isActive: true },
        '_id',
      ).lean();

      const roomNames = conversations.map((c) => convRoom(c._id));
      if (roomNames.length > 0) socket.join(roomNames);

      const updated = await User.findByIdAndUpdate(
        userId,
        { isOnline: true, lastSeenAt: new Date() },
        { new: true, projection: 'preferences.showOnlineStatus' },
      ).lean();

      const showOnlineStatus =
        updated?.preferences?.showOnlineStatus !== false;

      broadcastUserOnline(io, userId, roomNames, showOnlineStatus);

      registerPresenceHandlers(io, socket);
      registerTypingHandlers(io, socket);
      registerMessageHandlers(io, socket);

      if (!isProduction) {
        console.log(
          `[socket] connected user=${userId} socket=${socket.id} rooms=${roomNames.length}`,
        );
      }
    } catch (err) {
      // No ack exists at connect time, so report a generic error and drop the socket.
      console.error('[socket] connection setup failed:', err);
      socket.emit('server:error', { message: 'Connection setup failed' });
      socket.disconnect(true);
      return;
    }

    socket.on('disconnect', async (reason) => {
      try {
        clearActiveForSocket(socket);

        const remaining = removeUserSocket(userId, socket.id);

        // Only go offline when the user's last tab disconnects.
        if (remaining === 0) {
          const lastSeenAt = new Date();
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeenAt,
          });

          // socket.rooms is already empty by the time disconnect fires.
          const conversations = await Conversation.find(
            { participants: userId, isActive: true },
            '_id',
          ).lean();
          const roomNames = conversations.map((c) => convRoom(c._id));

          // Re-read in case the setting changed since this socket connected.
          const showOnlineStatus = await getShowOnlineStatus(userId);

          broadcastUserOffline(
            io,
            userId,
            roomNames,
            lastSeenAt,
            showOnlineStatus,
          );

          clearTypingForUser(io, userId);
        }

        if (!isProduction) {
          console.log(
            `[socket] disconnected user=${userId} socket=${socket.id} reason=${reason} remaining=${remaining}`,
          );
        }
      } catch (err) {
        console.error('[socket] disconnect cleanup failed:', err);
      }
    });
  });

  io.engine.on('connection_error', (err) => {
    if (!isProduction) {
      console.warn(
        `[socket] connection_error code=${err.code} message=${err.message}`,
      );
    }
  });
};
