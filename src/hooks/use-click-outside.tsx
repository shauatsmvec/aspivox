import { useEffect, RefObject } from 'react';

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      const target = event.target as HTMLElement;

      // Ignore if click is inside the target element
      if (!el || el.contains(target || null)) {
        return;
      }

      // Ignore if click is on a Radix UI portal (like Select dropdowns)
      if (
        target?.closest('[data-radix-portal]') || 
        target?.closest('[role="listbox"]') ||
        target?.closest('.radix-select-content')
      ) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
