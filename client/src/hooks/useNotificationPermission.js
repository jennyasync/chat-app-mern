import { useCallback, useEffect, useState } from 'react';

export function useNotificationPermission() {
  const isSupported =
    typeof window !== 'undefined' && 'Notification' in window;

  const [permission, setPermission] = useState(
    isSupported ? Notification.permission : 'unsupported',
  );

  // Browsers only show the prompt when this runs from a user gesture such as a click.
  const request = useCallback(async () => {
    if (!isSupported) return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  // Picks up permission changes made from the browser's site settings without a reload.
  useEffect(() => {
    if (!isSupported || !navigator.permissions?.query) return undefined;
    let status;
    let cancelled = false;
    const handler = () => {
      if (status && !cancelled) setPermission(status.state === 'prompt' ? 'default' : status.state);
    };

    navigator.permissions
      .query({ name: 'notifications' })
      .then((result) => {
        status = result;
        status.addEventListener('change', handler);
      })
      .catch(() => {
        // Some browsers can't query the 'notifications' permission.
      });

    return () => {
      cancelled = true;
      status?.removeEventListener('change', handler);
    };
  }, [isSupported]);

  return { permission, request, isSupported };
}
