import { Bell, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import { usePreferences } from '../../contexts/PreferencesContext.jsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';

const STORAGE_KEY_PREFIX = 'notificationBannerDismissed:';

const NotificationPermissionBanner = () => {
  const { user, isAuthenticated } = useAuth();
  const { notificationPermission, requestPermission } = useNotifications();
  const { preferences } = usePreferences();

  // Per-user key so a fresh login on a shared browser still sees it.
  const storageKey = `${STORAGE_KEY_PREFIX}${user?._id ?? user?.id ?? 'guest'}`;
  const [dismissed, setDismissed] = useLocalStorage(storageKey, false);

  const browserEnabled = preferences?.notifications?.browser !== false;
  const muteAll = preferences?.notifications?.muteAll === true;

  const shouldShow =
    isAuthenticated &&
    !dismissed &&
    browserEnabled &&
    !muteAll &&
    notificationPermission === 'default';

  if (!shouldShow) return null;

  // Browsers block or ignore permission prompts that are not triggered by a click.
  const handleEnable = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      setDismissed(true);
      toast.success('Browser notifications enabled');
    } else if (result === 'denied') {
      setDismissed(true);
      toast.error(
        'Permission denied. Enable from your browser settings if you change your mind.',
      );
    }
  };

  const handleDismiss = () => setDismissed(true);

  return (
    <div
      role="region"
      aria-label="Enable notifications"
      className="flex shrink-0 items-center justify-center gap-3 border-b border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-900 dark:border-brand-900/40 dark:bg-brand-950/40 dark:text-brand-100"
    >
      <Bell className="h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 truncate sm:flex-none">
        Turn on browser notifications for new messages.
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handleEnable}
          className="rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Enable
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-brand-800 transition-colors hover:bg-brand-100 dark:text-brand-200 dark:hover:bg-brand-900/60"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="rounded-md p-1 text-brand-700 transition-colors hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-900/60"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;
