'use client';
import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    if (typeof CSS === 'undefined') return;
    if (CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.feature-card, .faq-item, .cta-band, .component-showcase, .tuner-card, .command-console-card').forEach((el) => {
      observer.observe(el);
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
