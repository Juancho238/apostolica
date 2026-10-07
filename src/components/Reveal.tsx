import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';

/** Animates once on entry; content remains visible if animation is unavailable. */
export default function Reveal({ children, className = '', ...props }: ComponentPropsWithoutRef<'section'>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || props.role === 'dialog' || /\bsticky\b/.test(className)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window) || !element.animate) return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      animation = element.animate(
        [{ opacity: 0, translate: '0 18px' }, { opacity: 1, translate: '0 0' }],
        { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' },
      );
      observer.disconnect();
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    const stop = () => { if (preference.matches) { observer.disconnect(); animation?.cancel(); } };
    preference.addEventListener('change', stop);
    observer.observe(element);
    return () => { observer.disconnect(); animation?.cancel(); preference.removeEventListener('change', stop); };
  }, [className, props.role]);
  return <section ref={ref} className={className} {...props}>{children}</section>;
}
