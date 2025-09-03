'use client';

import { useEffect } from 'react';

export default function ScrollAnimation() {
  useEffect(() => {
    // 変更理由: 要素が存在しなければ早期returnし、Observer作成を避ける（軽微な最適化）
    const elements = document.querySelectorAll('.scroll-animate');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return null;
}
