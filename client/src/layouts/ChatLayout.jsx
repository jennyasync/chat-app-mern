import { useEffect, useState } from 'react';
import { Outlet, useMatch } from 'react-router-dom';
import clsx from 'clsx';
import { AlertTriangle, WifiOff } from 'lucide-react';

import Sidebar from '../components/layout/Sidebar.jsx';
import NewChatModal from '../components/chat/NewChatModal.jsx';
import NewGroupModal from '../components/chat/NewGroupModal.jsx';
import NotificationPermissionBanner from '../components/chat/NotificationPermissionBanner.jsx';
import {
  ChatStateProvider,
  useChatState,
} from '../contexts/ChatStateContext.jsx';
import { useSocket } from '../contexts/SocketContext.jsx';

// Long enough to ride out a Wi-Fi handover or laptop wake before showing the red banner.
const LONG_DISCONNECT_MS = 30_000;

// Separate component because it needs useChatState, which only works below ChatStateProvider.
const ChatComposers = () => {
  const { isNewChatOpen, isNewGroupOpen, closeComposer } = useChatState();
  return (
    <>
      <NewChatModal open={isNewChatOpen} onClose={closeComposer} />
      <NewGroupModal open={isNewGroupOpen} onClose={closeComposer} />
    </>
  );
};

// Copy stays generic on purpose: raw socket errors can leak server details.
const ConnectionStrip = () => {
  const { isConnected } = useSocket();
  const [longDisconnect, setLongDisconnect] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setLongDisconnect(false);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setLongDisconnect(true);
    }, LONG_DISCONNECT_MS);
    return () => window.clearTimeout(timer);
  }, [isConnected]);

  if (isConnected) return null;

  if (longDisconnect) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex shrink-0 items-center justify-center gap-2 bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm dark:bg-red-700"
      >
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Disconnected. Messages may not send.</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex shrink-0 items-center justify-center gap-2 bg-amber-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm dark:bg-amber-600"
    >
      <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Reconnecting…</span>
    </div>
  );
};

const ChatLayout = () => {
  const inConversation = useMatch('/chat/:conversationId');

  // On mobile the URL decides which pane shows, so the back gesture returns to the list.
  // h-dvh instead of h-screen so the mobile address bar doesn't hide the composer.
  return (
    <ChatStateProvider>
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
        <ConnectionStrip />

        <NotificationPermissionBanner />

        <div className="flex min-h-0 w-full flex-1 overflow-hidden">
          <div
            className={clsx(
              'h-full w-full md:w-80 md:max-w-xs md:shrink-0 lg:w-96',
              inConversation ? 'hidden md:flex' : 'flex',
            )}
          >
            <Sidebar />
          </div>

          <div
            className={clsx(
              'h-full min-w-0 flex-1',
              inConversation ? 'flex' : 'hidden md:flex',
            )}
          >
            <div className="flex h-full w-full flex-col overflow-hidden">
              <Outlet />
            </div>
          </div>
        </div>

        <ChatComposers />
      </div>
    </ChatStateProvider>
  );
};

export default ChatLayout;
