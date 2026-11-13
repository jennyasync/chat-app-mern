import { useEffect } from 'react';

export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    if (!handler) return undefined;

    const listener = (event) => {
      const el = ref.current;
      if (!el || el.contains(event.target)) return;
      handler(event);
    };

    // mousedown rather than click, so a drag that starts inside and ends outside doesn't close it.
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener, { passive: true });
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
