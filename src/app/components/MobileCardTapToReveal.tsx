'use client';

import { useEffect } from 'react';

export default function MobileCardTapToReveal() {
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    if (!isMobile) return;

    const cards: HTMLElement[] = Array.from(document.querySelectorAll('.service-card')) as HTMLElement[];

    const onClick = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      if (el.getAttribute('data-revealed') !== 'true') {
        e.preventDefault();
        e.stopPropagation();
        // Hide others
        cards.forEach((c) => {
          if (c !== el) c.removeAttribute('data-revealed');
        });
        el.setAttribute('data-revealed', 'true');
      }
    };

    cards.forEach((card) => {
      // ensure not already wired
      card.addEventListener('click', onClick);
    });

    return () => {
      cards.forEach((card) => card.removeEventListener('click', onClick));
    };
  }, []);

  return null;
}

