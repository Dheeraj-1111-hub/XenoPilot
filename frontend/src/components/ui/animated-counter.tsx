import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

export function AnimatedCounter({ 
  value, 
  direction = 'up',
  formatFn = (val: number) => val.toFixed(0)
}: { 
  value: number; 
  direction?: 'up' | 'down';
  formatFn?: (val: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 15,
    stiffness: 400,
  });
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatFn(latest);
      }
    });
  }, [springValue, formatFn]);

  return <span ref={ref} />;
}
