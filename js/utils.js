// ── Shared React hooks & Math component ──────────────────────────────────────

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// KaTeX inline/display
const M = ({ t, d = false }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(t, ref.current, {
        throwOnError: false,
        displayMode: d,
      });
    }
  }, [t, d]);
  return React.createElement('span', { ref });
};

// IntersectionObserver hook — triggers once when element enters viewport
const useInView = (threshold = 0.12) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

// Interval overlap check
const overlaps1D = (al, ah, bl, bh) => al <= bh && bl <= ah;
