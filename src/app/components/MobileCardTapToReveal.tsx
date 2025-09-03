'use client';

import { useEffect } from 'react';

export default function MobileCardTapToReveal() {
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    if (!isMobile) return;

    const cards: HTMLElement[] = Array.from(document.querySelectorAll('.service-card')) as HTMLElement[];
    // 変更理由: 対象要素が無い場合は早期returnし、無駄なハンドラ登録を回避（パフォーマンス微改善）
    if (cards.length === 0) return;

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
