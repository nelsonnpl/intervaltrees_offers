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
// ── Shared layout components ──────────────────────────────────────────────────

const Sec = ({ id, n, title, children }) => {
  const [ref, visible] = useInView(0.08);
  return React.createElement(
    'section',
    { id, ref, className: `section${visible ? ' visible' : ''}` },
    React.createElement(
      'div', { className: 'sec-head' },
      React.createElement('span', { className: 'sec-num' }, n),
      title
    ),
    React.createElement('div', { className: 'sec-body' }, children)
  );
};

const Fig = ({ n, label, caption, children }) =>
  React.createElement(
    'div', { className: 'fig-box' },
    React.createElement('div', { className: 'fig-label' }, `Figura ${n} — ${label}`),
    children,
    caption && React.createElement(
      'div', { className: 'fig-caption' },
      React.createElement('strong', null, `Fig. ${n}.`), ' ', caption
    )
  );

const CodeBlock = ({ lang = 'python', children }) =>
  React.createElement(
    'div', { className: 'code-wrap' },
    React.createElement(
      'div', { className: 'code-bar' },
      React.createElement('span', { style: { marginLeft: '1.5rem' } }, lang)
    ),
    React.createElement(
      'div', { className: 'code-pre' },
      React.createElement('pre', {
        style: { margin: 0 },
        dangerouslySetInnerHTML: { __html: children }
      })
    )
  );

const NoteInline = ({ children }) =>
  React.createElement('div', { className: 'note-inline' }, children);

const StatGrid = ({ items }) =>
  React.createElement(
    'div', { className: 'stat-grid' },
    items.map(({ label, value, sub, color }) =>
      React.createElement(
        'div', { key: label, className: 'stat-card', style: { borderTopColor: color } },
        React.createElement('div', { className: 'stat-label' }, label),
        React.createElement('div', { className: 'stat-value', style: { color } }, value),
        sub && React.createElement('div', { className: 'stat-sub' }, sub)
      )
    )
  );

const TOC = ({ items }) =>
  React.createElement(
    'nav', { className: 'toc' },
    React.createElement('div', { className: 'toc-title' }, 'Contenido'),
    React.createElement(
      'ul', { className: 'toc-list' },
      items.map(({ id, n, title }) =>
        React.createElement(
          'li', { key: id },
          React.createElement(
            'a', { href: `#${id}` },
            React.createElement('span', { className: 'toc-num' }, n),
            title
          )
        )
      )
    )
  );
// ── Fig 1 — Tres iteraciones del crosscheck (génesis del proyecto) ─────────
// Storytelling: prototipo pandas → motor polars/calamine → interval trees.
// Cada iteración mejora pero solo la última cambia el régimen de complejidad.

const FigJourney = () => {
  const [ref, visible] = useInView(0.12);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setActive(a => (a + 1) % 4), 2400);
    return () => clearInterval(t);
  }, [visible]);

  const iters = [
    {
      v: 'v 1.0', date: 'Sprint 0', tag: 'PROTOTIPO',
      stack: ['pandas', 'openpyxl'],
      time: '~ 45 min*', ram: 'OOM > 16 GB',
      status: 'INVIABLE', icon: '✗',
      color: '#991b1b', soft: '#ffe3e3',
      lesson: 'El motor no es el cuello de botella: lo es la materialización del producto cartesiano.',
      desc: 'Implementación inicial sobre pandas. La discretización fecha-a-fecha satura la RAM antes de completar el join.',
    },
    {
      v: 'v 3.x', date: 'Q+1', tag: 'OPTIMIZACIÓN',
      stack: ['Polars / Rust', 'calamine'],
      time: '~ 18 min', ram: '9,8 GB',
      status: 'AL LÍMITE', icon: '!',
      color: '#92400e', soft: '#fff4e6',
      lesson: 'Cambiar el motor pospone el muro pero no lo elimina. La complejidad sigue siendo cuadrática.',
      desc: 'Migración a Polars (núcleo Rust, lazy evaluation) y lectura xlsx con calamine. Throughput ×3, RAM ÷2.',
    },
    {
      v: 'v 5.x', date: 'Q+2', tag: 'CAMBIO DE PARADIGMA',
      stack: ['Interval Tree 2D', 'Polars'],
      time: '< 30 seg', ram: '~ 85 MB',
      status: 'ÓPTIMO', icon: '✓',
      color: '#15803d', soft: '#d3f9d8',
      lesson: 'La estructura de datos correcta gana al motor más rápido. Eliminar la dependencia de d₁·d₂ devuelve la viabilidad.',
      desc: 'Reformulación geométrica: cada oferta es un rectángulo en BW × TP. Indexación logarítmica reemplaza al join cartesiano.',
    },
  ];

  const W = 720, H = 360;
  const cardW = 200, cardH = 245;
  const gap = (W - 3 * cardW) / 4;
  const cardX = i => gap + i * (cardW + gap);
  const cardY = 28;

  const Card = ({ d, idx }) => {
    const isHi = active === idx || active === 3;
    return React.createElement('g', {
      style: { transition: 'transform 0.5s', cursor: 'pointer' },
      onClick: () => setActive(idx),
    },
      // Card background
      React.createElement('rect', {
        x: cardX(idx), y: cardY,
        width: cardW, height: cardH, rx: 4,
        fill: isHi ? d.soft : 'white',
        stroke: isHi ? d.color : '#d8d8d0',
        strokeWidth: isHi ? 2 : 1,
        style: {
          transition: 'fill 0.5s, stroke 0.5s, stroke-width 0.5s',
          filter: isHi ? `drop-shadow(0 4px 12px ${d.color}22)` : 'none'
        }
      }),

      // Top accent bar
      React.createElement('rect', {
        x: cardX(idx), y: cardY,
        width: cardW, height: 5,
        fill: d.color
      }),

      // Version + tag
      React.createElement('text', {
        x: cardX(idx) + 14, y: cardY + 26,
        fontSize: '10', fontWeight: '900',
        fill: d.color, letterSpacing: '0.04em',
        fontFamily: 'JetBrains Mono, monospace'
      }, d.v),
      React.createElement('text', {
        x: cardX(idx) + cardW - 14, y: cardY + 26,
        textAnchor: 'end',
        fontSize: '7', fontWeight: '700',
        fill: '#8a8a82', letterSpacing: '0.14em',
        fontFamily: 'JetBrains Mono, monospace'
      }, d.tag),

      // Date
      React.createElement('text', {
        x: cardX(idx) + 14, y: cardY + 42,
        fontSize: '8', fill: '#8a8a82',
        fontStyle: 'italic',
        fontFamily: 'EB Garamond, serif'
      }, d.date),

      // Tech stack chips
      ...d.stack.map((s, i) =>
        React.createElement('g', { key: s, transform: `translate(${cardX(idx) + 14}, ${cardY + 56 + i * 20})` },
          React.createElement('rect', {
            x: 0, y: 0, width: cardW - 28, height: 16, rx: 2,
            fill: '#fafaf7', stroke: '#ebeae3', strokeWidth: 1
          }),
          React.createElement('text', {
            x: 7, y: 11,
            fontSize: '8', fontWeight: '600',
            fill: '#1f1f1c', fontFamily: 'JetBrains Mono, monospace'
          }, s),
        )
      ),

      // Divider
      React.createElement('line', {
        x1: cardX(idx) + 14, x2: cardX(idx) + cardW - 14,
        y1: cardY + 105, y2: cardY + 105,
        stroke: '#ebeae3', strokeWidth: 1
      }),

      // Time metric
      React.createElement('text', {
        x: cardX(idx) + 14, y: cardY + 122,
        fontSize: '7', fontWeight: '700',
        fill: '#8a8a82', letterSpacing: '0.12em',
        fontFamily: 'JetBrains Mono, monospace'
      }, 'TIEMPO'),
      React.createElement('text', {
        x: cardX(idx) + cardW - 14, y: cardY + 122,
        textAnchor: 'end',
        fontSize: '13', fontWeight: '900',
        fill: d.color, fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '-0.02em'
      }, d.time),

      // RAM metric
      React.createElement('text', {
        x: cardX(idx) + 14, y: cardY + 146,
        fontSize: '7', fontWeight: '700',
        fill: '#8a8a82', letterSpacing: '0.12em',
        fontFamily: 'JetBrains Mono, monospace'
      }, 'RAM'),
      React.createElement('text', {
        x: cardX(idx) + cardW - 14, y: cardY + 146,
        textAnchor: 'end',
        fontSize: '13', fontWeight: '900',
        fill: d.color, fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '-0.02em'
      }, d.ram),

      // Status badge
      React.createElement('g', { transform: `translate(${cardX(idx) + 14}, ${cardY + 162})` },
        React.createElement('rect', {
          x: 0, y: 0, width: cardW - 28, height: 22, rx: 2,
          fill: d.color
        }),
        React.createElement('text', {
          x: 12, y: 15,
          fontSize: '11', fontWeight: '900',
          fill: 'white'
        }, d.icon),
        React.createElement('text', {
          x: cardW / 2 - 4, y: 15, textAnchor: 'middle',
          fontSize: '9', fontWeight: '700',
          fill: 'white', letterSpacing: '0.1em',
          fontFamily: 'JetBrains Mono, monospace'
        }, d.status)
      ),

      // Description (small)
      React.createElement('foreignObject', {
        x: cardX(idx) + 14, y: cardY + 195,
        width: cardW - 28, height: 50
      },
        React.createElement('div', {
          xmlns: 'http://www.w3.org/1999/xhtml',
          style: {
            fontSize: '0.6rem', lineHeight: 1.35,
            color: '#4a4a45', fontFamily: 'EB Garamond, serif',
            fontStyle: 'italic'
          }
        }, d.desc)
      )
    );
  };

  // Connector arrow between cards
  const Arrow = ({ from, to, lit }) => {
    const x1 = cardX(from) + cardW;
    const x2 = cardX(to);
    const y = cardY + cardH / 2;
    return React.createElement('g', null,
      React.createElement('line', {
        x1, y1: y, x2: x2 - 6, y2: y,
        stroke: lit ? '#0a0a0a' : '#d8d8d0',
        strokeWidth: lit ? 2 : 1.4,
        strokeDasharray: '5,3',
        style: { transition: 'stroke 0.5s, stroke-width 0.5s' }
      }),
      React.createElement('polygon', {
        points: `${x2 - 6},${y - 4} ${x2},${y} ${x2 - 6},${y + 4}`,
        fill: lit ? '#0a0a0a' : '#d8d8d0',
        style: { transition: 'fill 0.5s' }
      })
    );
  };

  // Lesson box (bottom)
  const lesson = active < 3 ? iters[active].lesson :
    'Tres iteraciones, un único aprendizaje: medir antes de optimizar y reformular antes de escalar.';
  const lessonColor = active < 3 ? iters[active].color : '#0a0a0a';

  return React.createElement('div', { ref, style: { fontFamily: 'JetBrains Mono, monospace' } },
    React.createElement('svg',
      { width: '100%', viewBox: `0 0 ${W} ${H}`, style: { overflow: 'visible' } },

      // Header
      React.createElement('text', {
        x: gap, y: 16,
        fontSize: '8.5', fontWeight: '700',
        fill: '#8a8a82', letterSpacing: '0.16em'
      }, 'EVOLUCIÓN DEL MOTOR · TRES ITERACIONES'),

      // Cards
      ...iters.map((d, i) => React.createElement(Card, { key: i, d, idx: i })),

      // Arrows
      React.createElement(Arrow, { from: 0, to: 1, lit: active >= 1 }),
      React.createElement(Arrow, { from: 1, to: 2, lit: active >= 2 }),

      // Lesson at bottom
      React.createElement('rect', {
        x: gap, y: H - 50, width: W - 2 * gap, height: 36, rx: 2,
        fill: '#fafaf7', stroke: lessonColor, strokeWidth: 1.2,
        style: { transition: 'stroke 0.4s' }
      }),
      React.createElement('text', {
        x: gap + 14, y: H - 31,
        fontSize: '8', fontWeight: '700',
        fill: lessonColor, letterSpacing: '0.12em'
      }, '→ APRENDIZAJE'),
      React.createElement('foreignObject', {
        x: gap + 110, y: H - 46, width: W - 2 * gap - 124, height: 32
      },
        React.createElement('div', {
          xmlns: 'http://www.w3.org/1999/xhtml',
          style: {
            fontSize: '0.78rem', lineHeight: 1.4,
            color: '#1f1f1c', fontFamily: 'EB Garamond, serif',
            fontStyle: 'italic'
          }
        }, lesson)
      ),

      // Step dots
      ...[0, 1, 2, 3].map(i =>
        React.createElement('circle', {
          key: `jd${i}`,
          cx: W / 2 - 21 + i * 14, cy: H - 4, r: 3.5,
          fill: i === active ? '#0a0a0a' : '#d8d8d0',
          style: { transition: 'fill 0.3s', cursor: 'pointer' },
          onClick: () => setActive(i),
        })
      )
    ),

    React.createElement('p', {
      style: {
        fontSize: '0.6rem', color: '#8a8a82', marginTop: '0.5rem',
        fontFamily: 'EB Garamond, serif', fontStyle: 'italic', textAlign: 'right'
      }
    }, '* tiempo medido cuando la ejecución no terminaba en OOM-kill antes de finalizar.')
  );
};
// ── Fig 1 — Representación geométrica BW × TP en R² ──────────────────────────
// Cada oferta es un rectángulo en el plano (Booking Window × Travel Period).
// La conciliación se reduce a detectar intersecciones rectangulares.

const Fig1 = () => {
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setTick(x => x + 1), 2400);
    return () => clearInterval(t);
  }, [paused]);

  const phase = tick % 5;
  const W = 460, H = 280;
  const pad = { l: 56, b: 46, r: 26, t: 28 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;
  const D = 32;
  const px = v => pad.l + (v / D) * iW;
  const py = v => H - pad.b - (v / D) * iH;

  // Three offers: A (origen), B & C (destino)
  const offers = [
    { id: 'A', bw: [2, 14],  tp: [6, 18],  c: '#1e3a8a', dash: false, label: 'O₁ origen' },
    { id: 'B', bw: [8, 22],  tp: [12, 26], c: '#15803d', dash: true,  label: 'O₂ destino' },
    { id: 'C', bw: [18, 30], tp: [4, 16],  c: '#5f3dc4', dash: true,  label: 'O₃ destino' },
  ];

  const showInter = phase === 4;
  const gridVals = [0, 8, 16, 24, 32];

  // Phase descriptions
  const phaseLabels = [
    'Fase 1 — Sistema origen define O₁',
    'Fase 2 — Sistema destino reporta O₂',
    'Fase 3 — Sistema destino reporta O₃',
    'Fase 4 — Vista superpuesta',
    'Fase 5 — Intersección O₁ ∩ O₂ detectada',
  ];

  return React.createElement('div',
    { onClick: () => setPaused(p => !p), style: { cursor: 'pointer', userSelect: 'none' }, title: 'Click para pausar / reanudar' },

    // Phase description bar
    React.createElement('div', {
      style: {
        fontSize: '0.66rem', fontFamily: 'JetBrains Mono, monospace',
        color: '#1f1f1c', marginBottom: '0.7rem',
        background: '#f5f4ee', padding: '0.45rem 0.85rem',
        borderLeft: '3px solid #0a0a0a',
        letterSpacing: '0.04em'
      }
    }, phaseLabels[phase]),

    React.createElement('svg', {
      width: '100%', viewBox: `0 0 ${W} ${H}`,
      style: { fontFamily: 'JetBrains Mono, monospace', overflow: 'visible' }
    },

      // Plane background
      React.createElement('rect', {
        x: pad.l, y: pad.t,
        width: iW, height: iH,
        fill: '#fafaf7', stroke: 'none'
      }),

      // Grid lines
      ...gridVals.flatMap(v => [
        React.createElement('line', {
          key: `gv${v}`,
          x1: px(v), y1: pad.t, x2: px(v), y2: H - pad.b,
          stroke: '#ebeae3', strokeWidth: '0.8'
        }),
        React.createElement('line', {
          key: `gh${v}`,
          x1: pad.l, y1: py(v), x2: W - pad.r, y2: py(v),
          stroke: '#ebeae3', strokeWidth: '0.8'
        }),
        React.createElement('text', {
          key: `lx${v}`,
          x: px(v), y: H - pad.b + 14,
          textAnchor: 'middle', fontSize: '7.5', fill: '#8a8a82'
        }, v),
        React.createElement('text', {
          key: `ly${v}`,
          x: pad.l - 6, y: py(v) + 3,
          textAnchor: 'end', fontSize: '7.5', fill: '#8a8a82'
        }, v),
      ]),

      // Axes
      React.createElement('line', {
        x1: pad.l, y1: pad.t, x2: pad.l, y2: H - pad.b,
        stroke: '#0a0a0a', strokeWidth: '1.5'
      }),
      React.createElement('line', {
        x1: pad.l, y1: H - pad.b, x2: W - pad.r, y2: H - pad.b,
        stroke: '#0a0a0a', strokeWidth: '1.5'
      }),

      // Axis labels
      React.createElement('text', {
        x: W / 2 + pad.l / 6, y: H - 6,
        textAnchor: 'middle', fontSize: '8.5', fill: '#1f1f1c',
        fontWeight: '700', letterSpacing: '0.08em'
      }, 'Booking Window  →  bw'),
      React.createElement('text', {
        x: 14, y: H / 2,
        textAnchor: 'middle', fontSize: '8.5', fill: '#1f1f1c',
        fontWeight: '700', letterSpacing: '0.08em',
        transform: `rotate(-90, 14, ${H / 2})`
      }, 'Travel Period  →  tp'),

      // Origin marker
      React.createElement('text', {
        x: pad.l - 6, y: H - pad.b + 14,
        textAnchor: 'end', fontSize: '7.5', fill: '#0a0a0a',
        fontStyle: 'italic'
      }, 'O'),

      // Offer rectangles
      ...offers.map((o, i) => {
        const x1 = px(o.bw[0]), x2 = px(o.bw[1]);
        const y1 = py(o.tp[1]), y2 = py(o.tp[0]);
        const visible = phase >= i || phase === 3 || phase === 4;
        const focused = phase === i || phase === 3 || phase === 4;
        return React.createElement('g', { key: o.id, opacity: visible ? 1 : 0,
          style: { transition: 'opacity 0.4s' }
        },
          React.createElement('rect', {
            x: x1, y: y1,
            width: x2 - x1, height: y2 - y1,
            fill: o.c,
            fillOpacity: focused ? 0.18 : 0.06,
            stroke: o.c,
            strokeWidth: focused ? 2.2 : 0.9,
            strokeDasharray: o.dash ? '5,3' : 'none',
            style: { transition: 'fill-opacity 0.4s, stroke-width 0.4s' }
          }),
          // Corner endpoints
          React.createElement('circle', { cx: x1, cy: y2, r: 2.5, fill: o.c, opacity: focused ? 1 : 0.4 }),
          React.createElement('circle', { cx: x2, cy: y1, r: 2.5, fill: o.c, opacity: focused ? 1 : 0.4 }),
          // Label
          focused && React.createElement('text', {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2 + 3,
            textAnchor: 'middle',
            fontSize: '8',
            fontWeight: '700',
            fill: o.c,
            className: 'svg-fade-in',
          }, o.label),
        );
      }),

      // Intersection region O₁ ∩ O₂
      showInter && React.createElement('g', { className: 'svg-fade-in' },
        React.createElement('rect', {
          x: px(8), y: py(18),
          width: px(14) - px(8),
          height: py(12) - py(18),
          fill: '#991b1b', fillOpacity: 0.4,
          stroke: '#991b1b', strokeWidth: '1.6'
        }),
        React.createElement('text', {
          x: (px(8) + px(14)) / 2,
          y: (py(18) + py(12)) / 2 + 3,
          textAnchor: 'middle', fontSize: '8',
          fontWeight: '700', fill: '#7f1d1d'
        }, 'O₁ ∩ O₂'),
        // Annotation arrow
        React.createElement('line', {
          x1: (px(8) + px(14)) / 2 + 22,
          y1: (py(18) + py(12)) / 2 - 12,
          x2: (px(8) + px(14)) / 2 + 8,
          y2: (py(18) + py(12)) / 2 - 4,
          stroke: '#7f1d1d', strokeWidth: 1
        }),
        React.createElement('text', {
          x: (px(8) + px(14)) / 2 + 26,
          y: (py(18) + py(12)) / 2 - 14,
          fontSize: '7', fill: '#7f1d1d', fontStyle: 'italic'
        }, 'match!'),
      ),

      // Legend
      React.createElement('rect', {
        x: W - 138, y: pad.t + 2,
        width: 122, height: 64,
        fill: 'white', stroke: '#d8d8d0', strokeWidth: '1', rx: 2
      }),
      ...[
        { c: '#1e3a8a', dash: false, lbl: 'origen ─── sólido' },
        { c: '#15803d', dash: true,  lbl: 'destino ╴╴ punteado' },
        { c: '#991b1b', dash: false, lbl: 'intersección' },
      ].map((l, i) =>
        React.createElement('g', {
          key: l.lbl,
          transform: `translate(${W - 132}, ${pad.t + 12 + i * 18})`
        },
          React.createElement('rect', {
            width: 14, height: 9,
            fill: l.c, fillOpacity: 0.22,
            stroke: l.c, strokeDasharray: l.dash ? '4,2' : 'none',
            strokeWidth: '1.3'
          }),
          React.createElement('text', {
            x: 19, y: 8, fontSize: '7.5', fill: '#1f1f1c'
          }, l.lbl),
        )
      ),

      // Phase indicator dots
      ...[0, 1, 2, 3, 4].map(i =>
        React.createElement('circle', {
          key: `dot${i}`,
          cx: W / 2 - 28 + i * 14,
          cy: H - 4,
          r: 3.5,
          fill: i === phase ? '#0a0a0a' : '#d8d8d0',
          style: { transition: 'fill 0.3s' }
        })
      ),

      // Pause overlay
      paused && React.createElement('g', null,
        React.createElement('rect', {
          x: W / 2 - 32, y: H - 26, width: 64, height: 16, rx: 2,
          fill: '#0a0a0a', fillOpacity: 0.85
        }),
        React.createElement('text', {
          x: W / 2, y: H - 15, textAnchor: 'middle',
          fontSize: '7.5', fill: 'white',
          letterSpacing: '0.1em'
        }, '⏸ PAUSADO')
      )
    )
  );
};
// ── Fig 2 — Pipeline: archivos de entrada → árbol de intervalos → reporte ───
// Muestra el flujo completo de procesamiento: dos archivos heterogéneos
// (xlsx, csv) se normalizan, se indexan en el árbol, se cotejan y se exporta
// un reporte tabular con el estado de cada oferta.

const Fig2 = () => {
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setPhase(p => (p + 1) % 5), 2200);
    return () => clearInterval(t);
  }, [paused]);

  // ── Layout dimensions ─────────────────────────────────────────────────────
  const W = 520, H = 300;

  // Stage X-positions
  const stages = {
    src:    { x: 16,  w: 100 },
    parse:  { x: 138, w: 90  },
    tree:   { x: 250, w: 96  },
    diff:   { x: 362, w: 80  },
    out:    { x: 458, w: 56  },
  };

  const isActive = (idx) => phase >= idx;
  const isCurrent = (idx) => phase === idx;

  // ── Color helpers ─────────────────────────────────────────────────────────
  const inkActive  = '#0a0a0a';
  const inkIdle    = '#b8b8af';
  const accentBlue = '#1e3a8a';
  const accentGreen= '#15803d';
  const accentAmber= '#92400e';

  // ── Reusable: dotted connector with travelling pulse ──────────────────────
  const Connector = ({ x1, x2, y, active }) =>
    React.createElement('g', null,
      React.createElement('line', {
        x1, x2, y1: y, y2: y,
        stroke: active ? inkActive : inkIdle,
        strokeWidth: 1.4,
        strokeDasharray: '3,3',
        style: { transition: 'stroke 0.4s' }
      }),
      // Travelling pulse
      active && React.createElement('circle', {
        cx: x1, cy: y, r: 3, fill: accentBlue,
        style: {
          animation: `pulse-travel-${y} 1.4s linear infinite`,
        }
      }),
      // Inline keyframes
      active && React.createElement('style', null,
        `@keyframes pulse-travel-${y} {
          0%   { transform: translateX(0); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(${x2 - x1}px); opacity: 0; }
        }`
      ),
      // Arrow head
      React.createElement('path', {
        d: `M${x2 - 5},${y - 3} L${x2},${y} L${x2 - 5},${y + 3}`,
        fill: 'none',
        stroke: active ? inkActive : inkIdle,
        strokeWidth: 1.4,
        strokeLinejoin: 'miter',
        style: { transition: 'stroke 0.4s' }
      }),
    );

  // ── Stage label (above each box) ──────────────────────────────────────────
  const StageLabel = ({ x, w, n, txt, active }) =>
    React.createElement('g', null,
      React.createElement('text', {
        x: x + w / 2, y: 16,
        textAnchor: 'middle',
        fontSize: '6.5',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: '600',
        letterSpacing: '0.16em',
        fill: active ? '#0a0a0a' : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, `${n} · ${txt}`),
    );

  // ── 1. Source files (xlsx + csv) ─────────────────────────────────────────
  const SourceFiles = () => {
    const a = isActive(0);
    return React.createElement('g', null,
      // xlsx file
      React.createElement('g', { transform: `translate(${stages.src.x + 8}, 38)` },
        React.createElement('rect', {
          width: 84, height: 70, rx: 2,
          fill: 'white',
          stroke: a ? '#15803d' : '#b8b8af',
          strokeWidth: a ? 1.6 : 1,
          style: { transition: 'stroke 0.4s' }
        }),
        // Folded corner
        React.createElement('path', {
          d: 'M70,0 L84,14 L70,14 Z',
          fill: a ? '#d3f9d8' : '#e8e7df',
          stroke: a ? '#15803d' : '#b8b8af',
          strokeWidth: a ? 1.6 : 1,
          style: { transition: 'all 0.4s' }
        }),
        // Header rows
        ...[26, 36, 46, 56].map((y, i) =>
          React.createElement('rect', {
            key: `r${y}`,
            x: 6, y, width: 56, height: 4,
            fill: i === 0 ? (a ? '#15803d' : '#b8b8af') : (a ? '#d3f9d8' : '#ebeae3'),
            opacity: i === 0 ? 0.85 : 0.7,
            style: { transition: 'fill 0.4s' }
          })
        ),
        React.createElement('text', {
          x: 6, y: 19, fontSize: '7', fontFamily: 'JetBrains Mono, monospace',
          fontWeight: '700', fill: a ? '#15803d' : '#8a8a82',
          style: { transition: 'fill 0.4s' }
        }, '.XLSX'),
      ),

      // csv file (slightly behind/below)
      React.createElement('g', { transform: `translate(${stages.src.x + 18}, 124)` },
        React.createElement('rect', {
          width: 76, height: 60, rx: 2,
          fill: 'white',
          stroke: a ? '#92400e' : '#b8b8af',
          strokeWidth: a ? 1.6 : 1,
          style: { transition: 'stroke 0.4s' }
        }),
        React.createElement('path', {
          d: 'M62,0 L76,14 L62,14 Z',
          fill: a ? '#fff4e6' : '#e8e7df',
          stroke: a ? '#92400e' : '#b8b8af',
          strokeWidth: a ? 1.6 : 1,
          style: { transition: 'all 0.4s' }
        }),
        // Comma-separated lines
        ...[26, 35, 44].map((y, i) =>
          React.createElement('text', {
            key: `c${y}`,
            x: 5, y,
            fontSize: '5.5',
            fontFamily: 'JetBrains Mono, monospace',
            fill: a ? '#92400e' : '#b8b8af',
            opacity: 0.7,
            style: { transition: 'fill 0.4s' }
          }, ['a;b;c;d', '01;12;15', '02;13;20'][i])
        ),
        React.createElement('text', {
          x: 5, y: 19, fontSize: '7', fontFamily: 'JetBrains Mono, monospace',
          fontWeight: '700', fill: a ? '#92400e' : '#8a8a82',
          style: { transition: 'fill 0.4s' }
        }, '.CSV'),
      ),

      // Description below
      React.createElement('text', {
        x: stages.src.x + stages.src.w / 2, y: 200,
        textAnchor: 'middle', fontSize: '7',
        fontFamily: 'EB Garamond, serif',
        fontStyle: 'italic',
        fill: a ? '#4a4a45' : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, 'Heterogéneo'),
      React.createElement('text', {
        x: stages.src.x + stages.src.w / 2, y: 211,
        textAnchor: 'middle', fontSize: '7',
        fontFamily: 'EB Garamond, serif',
        fontStyle: 'italic',
        fill: a ? '#4a4a45' : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, 'origen vs. destino'),
    );
  };

  // ── 2. Parser/Normalizer ─────────────────────────────────────────────────
  const Parser = () => {
    const a = isActive(1);
    return React.createElement('g', null,
      React.createElement('rect', {
        x: stages.parse.x, y: 60,
        width: stages.parse.w, height: 130,
        rx: 3,
        fill: 'white',
        stroke: a ? inkActive : inkIdle,
        strokeWidth: a ? 1.8 : 1,
        style: { transition: 'stroke 0.4s' }
      }),
      React.createElement('text', {
        x: stages.parse.x + stages.parse.w / 2, y: 78,
        textAnchor: 'middle', fontSize: '8',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: '700',
        fill: a ? inkActive : inkIdle,
        style: { transition: 'fill 0.4s' }
      }, 'parse() / clean()'),

      // Table preview inside
      ...['hotel │ room │ bw │ tp', '──────┼──────┼────┼───',
          'A1234 │ DDST │ +12│ 06', 'A1234 │ DDST │ +12│ 07',
          'B0027 │ JRSU │ +30│ 18', 'C0099 │ DJSL │ +05│ 22']
        .map((line, i) =>
          React.createElement('text', {
            key: `pl${i}`,
            x: stages.parse.x + 6, y: 95 + i * 12,
            fontSize: '5.5',
            fontFamily: 'JetBrains Mono, monospace',
            fill: a ? '#0a0a0a' : '#b8b8af',
            opacity: a ? (i < 2 ? 0.85 : 0.95) : 0.5,
            style: { transition: 'fill 0.4s, opacity 0.4s' }
          }, line)
        ),

      React.createElement('text', {
        x: stages.parse.x + stages.parse.w / 2, y: 200,
        textAnchor: 'middle', fontSize: '7',
        fontFamily: 'EB Garamond, serif',
        fontStyle: 'italic',
        fill: a ? '#4a4a45' : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, 'Esquema'),
      React.createElement('text', {
        x: stages.parse.x + stages.parse.w / 2, y: 211,
        textAnchor: 'middle', fontSize: '7',
        fontFamily: 'EB Garamond, serif',
        fontStyle: 'italic',
        fill: a ? '#4a4a45' : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, 'unificado'),
    );
  };

  // ── 3. Interval Tree 2D ──────────────────────────────────────────────────
  const TreeBox = () => {
    const a = isActive(2);
    const cx = stages.tree.x + stages.tree.w / 2;

    // Mini tree: 1 root + 2 children + 4 grandchildren
    const treeNodes = [
      { x: 0,   y: 100, lbl: '15' },
      { x: -22, y: 122, lbl: '7' },
      { x: 22,  y: 122, lbl: '23' },
      { x: -34, y: 144, lbl: '3' },
      { x: -10, y: 144, lbl: '11' },
      { x: 10,  y: 144, lbl: '19' },
      { x: 34,  y: 144, lbl: '27' },
    ];
    const treeEdges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];

    return React.createElement('g', null,
      React.createElement('rect', {
        x: stages.tree.x, y: 60,
        width: stages.tree.w, height: 130,
        rx: 3,
        fill: 'white',
        stroke: a ? accentBlue : inkIdle,
        strokeWidth: a ? 1.8 : 1,
        style: { transition: 'stroke 0.4s' }
      }),
      React.createElement('text', {
        x: cx, y: 78,
        textAnchor: 'middle', fontSize: '8',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: '700',
        fill: a ? accentBlue : inkIdle,
        style: { transition: 'fill 0.4s' }
      }, 'Interval Tree 2D'),

      // Tree edges
      ...treeEdges.map(([fr, to], i) =>
        React.createElement('line', {
          key: `te${i}`,
          x1: cx + treeNodes[fr].x, y1: treeNodes[fr].y + 5,
          x2: cx + treeNodes[to].x, y2: treeNodes[to].y - 5,
          stroke: a ? accentBlue : inkIdle,
          strokeWidth: 1, opacity: 0.6,
          style: { transition: 'stroke 0.4s' }
        })
      ),

      // Tree nodes
      ...treeNodes.map((n, i) =>
        React.createElement('g', {
          key: `tn${i}`,
          className: a ? 'svg-fade-in' : '',
          style: { animationDelay: `${i * 70}ms` }
        },
          React.createElement('circle', {
            cx: cx + n.x, cy: n.y, r: 6,
            fill: a ? '#dbe4ff' : '#e8e7df',
            stroke: a ? accentBlue : inkIdle,
            strokeWidth: 1.3,
            style: { transition: 'fill 0.4s, stroke 0.4s' }
          }),
          React.createElement('text', {
            x: cx + n.x, y: n.y + 2.4,
            textAnchor: 'middle', fontSize: '5.5',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: '600',
            fill: a ? accentBlue : '#8a8a82',
            style: { transition: 'fill 0.4s' }
          }, n.lbl)
        )
      ),

      React.createElement('text', {
        x: cx, y: 200,
        textAnchor: 'middle', fontSize: '7',
        fontFamily: 'EB Garamond, serif',
        fontStyle: 'italic',
        fill: a ? '#4a4a45' : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, 'Indexación'),
      React.createElement('text', {
        x: cx, y: 211,
        textAnchor: 'middle', fontSize: '7',
        fontFamily: 'EB Garamond, serif',
        fontStyle: 'italic',
        fill: a ? '#4a4a45' : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, 'O(n log n) espacio'),
    );
  };

  // ── 4. Cross-check / diff ────────────────────────────────────────────────
  const Diff = () => {
    const a = isActive(3);
    const cx = stages.diff.x + stages.diff.w / 2;
    return React.createElement('g', null,
      React.createElement('rect', {
        x: stages.diff.x, y: 60,
        width: stages.diff.w, height: 130,
        rx: 3,
        fill: 'white',
        stroke: a ? inkActive : inkIdle,
        strokeWidth: a ? 1.8 : 1,
        style: { transition: 'stroke 0.4s' }
      }),
      React.createElement('text', {
        x: cx, y: 78,
        textAnchor: 'middle', fontSize: '8',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: '700',
        fill: a ? inkActive : inkIdle,
        style: { transition: 'fill 0.4s' }
      }, 'cross-check'),

      // Two overlapping circles (set-diff visual)
      React.createElement('circle', {
        cx: cx - 10, cy: 132, r: 19,
        fill: a ? 'rgba(21, 128, 61, 0.18)' : 'rgba(184,184,175,0.15)',
        stroke: a ? accentGreen : inkIdle,
        strokeWidth: 1.4,
        style: { transition: 'all 0.4s' }
      }),
      React.createElement('circle', {
        cx: cx + 10, cy: 132, r: 19,
        fill: a ? 'rgba(30, 58, 138, 0.18)' : 'rgba(184,184,175,0.15)',
        stroke: a ? accentBlue : inkIdle,
        strokeWidth: 1.4,
        style: { transition: 'all 0.4s' }
      }),
      React.createElement('text', {
        x: cx - 18, y: 135, textAnchor: 'middle',
        fontSize: '6', fontFamily: 'JetBrains Mono, monospace',
        fill: a ? accentGreen : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, 'src'),
      React.createElement('text', {
        x: cx + 18, y: 135, textAnchor: 'middle',
        fontSize: '6', fontFamily: 'JetBrains Mono, monospace',
        fill: a ? accentBlue : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, 'dst'),
      React.createElement('text', {
        x: cx, y: 135, textAnchor: 'middle',
        fontSize: '6', fontFamily: 'JetBrains Mono, monospace',
        fontWeight: '700',
        fill: a ? '#0a0a0a' : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, '∩'),

      React.createElement('text', {
        x: cx, y: 200,
        textAnchor: 'middle', fontSize: '7',
        fontFamily: 'EB Garamond, serif',
        fontStyle: 'italic',
        fill: a ? '#4a4a45' : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, 'Estados:'),
      React.createElement('text', {
        x: cx, y: 211,
        textAnchor: 'middle', fontSize: '7',
        fontFamily: 'EB Garamond, serif',
        fontStyle: 'italic',
        fill: a ? '#4a4a45' : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, 'OK · Δ · Falta'),
    );
  };

  // ── 5. Output report ─────────────────────────────────────────────────────
  const Output = () => {
    const a = isActive(4);
    return React.createElement('g', null,
      React.createElement('g', { transform: `translate(${stages.out.x}, 80)` },
        React.createElement('rect', {
          width: 56, height: 90, rx: 2,
          fill: 'white',
          stroke: a ? inkActive : inkIdle,
          strokeWidth: a ? 1.8 : 1,
          style: { transition: 'stroke 0.4s' }
        }),
        React.createElement('path', {
          d: 'M44,0 L56,12 L44,12 Z',
          fill: a ? '#ebeae3' : '#e8e7df',
          stroke: a ? inkActive : inkIdle,
          strokeWidth: a ? 1.8 : 1,
          style: { transition: 'all 0.4s' }
        }),
        // Header label
        React.createElement('text', {
          x: 4, y: 19,
          fontSize: '6.5', fontFamily: 'JetBrains Mono, monospace',
          fontWeight: '700',
          fill: a ? '#0a0a0a' : '#8a8a82',
          style: { transition: 'fill 0.4s' }
        }, 'reporte.xlsx'),
        // Status rows (colored)
        ...[
          { y: 30, c: a ? '#15803d' : '#d8d8d0', t: 'OK   · 80%' },
          { y: 42, c: a ? '#92400e' : '#d8d8d0', t: 'Δ    · 12%' },
          { y: 54, c: a ? '#991b1b' : '#d8d8d0', t: 'Falta · 8%' },
        ].map((r, i) =>
          React.createElement('g', {
            key: `or${i}`,
            className: a ? 'svg-fade-in' : '',
            style: { animationDelay: `${i * 100 + 100}ms` }
          },
            React.createElement('rect', {
              x: 4, y: r.y - 7, width: 4, height: 8,
              fill: r.c, style: { transition: 'fill 0.4s' }
            }),
            React.createElement('text', {
              x: 11, y: r.y,
              fontSize: '5.5', fontFamily: 'JetBrains Mono, monospace',
              fill: a ? '#0a0a0a' : '#b8b8af',
              style: { transition: 'fill 0.4s' }
            }, r.t)
          )
        ),
      ),

      React.createElement('text', {
        x: stages.out.x + stages.out.w / 2, y: 200,
        textAnchor: 'middle', fontSize: '7',
        fontFamily: 'EB Garamond, serif',
        fontStyle: 'italic',
        fill: a ? '#4a4a45' : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, 'Reporte'),
      React.createElement('text', {
        x: stages.out.x + stages.out.w / 2, y: 211,
        textAnchor: 'middle', fontSize: '7',
        fontFamily: 'EB Garamond, serif',
        fontStyle: 'italic',
        fill: a ? '#4a4a45' : '#b8b8af',
        style: { transition: 'fill 0.4s' }
      }, 'consolidado'),
    );
  };

  return React.createElement(
    'div',
    { onClick: () => setPaused(p => !p), style: { cursor: 'pointer', userSelect: 'none' }, title: 'Click para pausar / reanudar' },

    React.createElement('svg', {
      width: '100%', viewBox: `0 0 ${W} ${H}`,
      style: { fontFamily: 'JetBrains Mono, monospace', overflow: 'visible' }
    },

      // Stage labels
      React.createElement(StageLabel, { x: stages.src.x,   w: stages.src.w,   n: '01', txt: 'INPUT',   active: isActive(0) }),
      React.createElement(StageLabel, { x: stages.parse.x, w: stages.parse.w, n: '02', txt: 'PARSE',   active: isActive(1) }),
      React.createElement(StageLabel, { x: stages.tree.x,  w: stages.tree.w,  n: '03', txt: 'INDEX',   active: isActive(2) }),
      React.createElement(StageLabel, { x: stages.diff.x,  w: stages.diff.w,  n: '04', txt: 'CHECK',   active: isActive(3) }),
      React.createElement(StageLabel, { x: stages.out.x,   w: stages.out.w,   n: '05', txt: 'OUTPUT',  active: isActive(4) }),

      // Connectors between stages
      React.createElement(Connector, {
        x1: stages.src.x + stages.src.w - 4,   x2: stages.parse.x,
        y: 125, active: isCurrent(1) || phase >= 1
      }),
      React.createElement(Connector, {
        x1: stages.parse.x + stages.parse.w,   x2: stages.tree.x,
        y: 125, active: isCurrent(2) || phase >= 2
      }),
      React.createElement(Connector, {
        x1: stages.tree.x + stages.tree.w,     x2: stages.diff.x,
        y: 125, active: isCurrent(3) || phase >= 3
      }),
      React.createElement(Connector, {
        x1: stages.diff.x + stages.diff.w,     x2: stages.out.x,
        y: 125, active: isCurrent(4) || phase >= 4
      }),

      // Stages
      React.createElement(SourceFiles),
      React.createElement(Parser),
      React.createElement(TreeBox),
      React.createElement(Diff),
      React.createElement(Output),

      // Phase progress dots
      ...[0, 1, 2, 3, 4].map(i =>
        React.createElement('circle', {
          key: `pd${i}`,
          cx: W / 2 - 28 + i * 14, cy: H - 8, r: 3.5,
          fill: i === phase ? '#0a0a0a' : '#d8d8d0',
          style: { transition: 'fill 0.3s' }
        })
      ),

      // Pause indicator
      paused && React.createElement('g', null,
        React.createElement('rect', {
          x: W / 2 - 32, y: H - 28, width: 64, height: 16, rx: 2,
          fill: '#0a0a0a', fillOpacity: 0.85
        }),
        React.createElement('text', {
          x: W / 2, y: H - 17, textAnchor: 'middle',
          fontSize: '7.5', fill: 'white',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.1em'
        }, '⏸ PAUSADO')
      )
    )
  );
};
// ── Fig 3 — Modelo naive: explosión cartesiana ──────────────────────────────
// Una oferta con BW = 5 días y TP = 5 días genera 25 filas en memoria
// tras la discretización. La inflación es O(d₁ · d₂).

const Fig3 = () => {
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setPhase(p => (p + 1) % 4), 2600);
    return () => clearInterval(t);
  }, [paused]);

  const bw = ['01/06', '02/06', '03/06', '04/06', '05/06'];
  const tp = ['01/09', '02/09', '03/09', '04/09', '05/09'];
  const total = bw.length * tp.length;

  return React.createElement('div',
    { onClick: () => setPaused(p => !p), style: { cursor: 'pointer', userSelect: 'none' }, title: 'Click para pausar / reanudar', },

    React.createElement('div', { style: { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem' } },

      // Top row: input → arrow → output
      React.createElement('div',
        { style: { display: 'flex', gap: '2rem', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' } },

        // ── Input card ────────────────────────────────────────────────────
        React.createElement('div', { style: { textAlign: 'center' } },
          React.createElement('div', {
            style: {
              fontSize: '0.6rem', color: '#8a8a82',
              textTransform: 'uppercase', letterSpacing: '0.14em',
              marginBottom: '0.55rem', fontWeight: '600'
            }
          }, '01 · OFERTA (entrada)'),
          React.createElement('div', {
            style: {
              border: '2px solid #1e3a8a',
              padding: '0.8rem 1.05rem',
              background: 'white', minWidth: '170px',
              boxShadow: '0 2px 12px rgba(30,58,138,0.08)',
              transition: 'box-shadow 0.3s'
            }
          },
            React.createElement('div', {
              style: {
                fontWeight: '700',
                borderBottom: '1px solid #ebeae3',
                paddingBottom: '0.35rem',
                marginBottom: '0.4rem',
                color: '#1e3a8a',
                letterSpacing: '0.05em'
              }
            }, 'Oᵢ — registro único'),
            React.createElement('div', { style: { color: '#4a4a45', marginBottom: '2px' } }, 'bw: [01/06 → 05/06]'),
            React.createElement('div', { style: { color: '#4a4a45', marginBottom: '2px' } }, 'tp: [01/09 → 05/09]'),
            React.createElement('div', { style: { color: '#15803d', fontWeight: '700', marginTop: '0.35rem' } }, 'δ = 0.15'),
          ),
          React.createElement('div', {
            style: {
              marginTop: '0.55rem',
              background: '#dbe4ff', border: '1px solid #b4c0ff',
              padding: '0.32rem 0.7rem', fontSize: '0.62rem',
              color: '#1e3a8a', fontWeight: '600',
              letterSpacing: '0.04em'
            }
          }, '1 fila en memoria')
        ),

        // ── Arrow ─────────────────────────────────────────────────────────
        React.createElement('div',
          { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '1.6rem' } },

          React.createElement('div', {
            style: {
              fontSize: '0.6rem',
              color: phase > 0 ? '#991b1b' : '#b8b8af',
              textTransform: 'uppercase', fontWeight: '700',
              marginBottom: '0.35rem', letterSpacing: '0.1em',
              transition: 'color 0.3s', fontFamily: 'JetBrains Mono, monospace'
            }
          }, 'cartesian explode()'),

          React.createElement('svg', { width: 36, height: 22 },
            React.createElement('defs', null,
              React.createElement('marker', {
                id: 'arrow-head-fig3',
                viewBox: '0 0 10 10', refX: '8', refY: '5',
                markerWidth: '6', markerHeight: '6', orient: 'auto'
              },
                React.createElement('path', {
                  d: 'M0,0 L10,5 L0,10 Z',
                  fill: phase > 0 ? '#991b1b' : '#d8d8d0'
                })
              )
            ),
            React.createElement('line', {
              x1: 2, y1: 11, x2: 30, y2: 11,
              stroke: phase > 0 ? '#991b1b' : '#d8d8d0',
              strokeWidth: '2',
              markerEnd: 'url(#arrow-head-fig3)',
              style: { transition: 'stroke 0.3s' }
            })
          ),

          React.createElement('div', {
            style: { fontSize: '0.62rem', color: '#8a8a82', marginTop: '0.35rem', fontStyle: 'italic' }
          }, `factor ×${total}`)
        ),

        // ── Output area ───────────────────────────────────────────────────
        React.createElement('div',
          { style: { textAlign: 'center', minWidth: '195px' } },

          React.createElement('div', {
            style: {
              fontSize: '0.6rem', color: '#8a8a82',
              textTransform: 'uppercase', letterSpacing: '0.14em',
              marginBottom: '0.55rem', fontWeight: '600'
            }
          }, '02 · DATASET EXPANDIDO'),

          phase === 0 && React.createElement('div', {
            style: {
              border: '2px dashed #d8d8d0', height: '128px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#b8b8af', fontStyle: 'italic', fontSize: '0.7rem'
            }
          }, 'Esperando…'),

          phase === 1 && React.createElement('div', null,
            bw.slice(0, 3).map((d, i) =>
              React.createElement('div', {
                key: i,
                className: 'anim-in',
                style: {
                  background: 'white',
                  border: '1px solid #fff4e6',
                  borderLeft: '3px solid #d97706',
                  padding: '4px 10px', marginBottom: '3px',
                  display: 'flex', justifyContent: 'space-between',
                  animationDelay: `${i * 90}ms`,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem'
                }
              },
                React.createElement('span', { style: { color: '#92400e', fontWeight: '700' } }, d),
                React.createElement('span', { style: { color: '#b8b8af' } }, 'tp:[01/09→05/09] · 0.15')
              )
            ),
            React.createElement('div', {
              style: { color: '#92400e', fontSize: '0.62rem', marginTop: '0.35rem', fontStyle: 'italic' }
            }, `… ×${tp.length} fechas tp pendientes`)
          ),

          phase === 2 && React.createElement('div',
            { style: { maxHeight: '135px', overflowY: 'auto', paddingRight: '4px' } },
            bw.flatMap((b, i) => tp.map((p, j) =>
              React.createElement('div', {
                key: `${i}${j}`,
                className: 'anim-in',
                style: {
                  background: 'white',
                  border: '1px solid #ffe3e3',
                  borderLeft: '3px solid #991b1b',
                  padding: '2.5px 7px', marginBottom: '1.5px',
                  display: 'flex', gap: '8px',
                  animationDelay: `${(i * 5 + j) * 30}ms`,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.66rem'
                }
              },
                React.createElement('span', { style: { color: '#991b1b', fontWeight: '700' } }, b),
                React.createElement('span', { style: { color: '#c92a2a' } }, p),
                React.createElement('span', { style: { color: '#b8b8af' } }, '0.15')
              )
            ))
          ),

          phase === 3 && React.createElement('div', null,
            React.createElement('div', {
              style: {
                background: '#0a0a0a', color: 'white',
                padding: '1rem 0.7rem', textAlign: 'center',
                fontFamily: 'JetBrains Mono, monospace'
              }
            },
              React.createElement('div', {
                style: { fontSize: '1.7rem', fontWeight: '900', lineHeight: '1.1' }
              }, `${total}`),
              React.createElement('div', {
                style: { fontSize: '0.6rem', letterSpacing: '0.12em', marginTop: '4px', color: '#b8b8af' }
              }, 'FILAS POR OFERTA'),
              React.createElement('div', {
                style: { fontSize: '0.55rem', marginTop: '8px', color: '#8a8a82', fontStyle: 'italic' }
              }, 'O(d₁ · d₂) — cuadrático en duración')
            )
          ),

          (phase === 2 || phase === 3) && React.createElement('div', {
            style: {
              marginTop: '0.55rem',
              background: '#ffe3e3', border: '1px solid #ff8787',
              padding: '0.32rem 0.7rem', fontSize: '0.62rem',
              color: '#991b1b', fontWeight: '700',
              letterSpacing: '0.04em'
            }
          }, `${total} filas — factor ×${total}`)
        )
      ),

      // ── Phase dots ─────────────────────────────────────────────────────
      React.createElement('div', {
        style: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.1rem' }
      },
        ...[0, 1, 2, 3].map(i =>
          React.createElement('span', {
            key: `dot${i}`,
            style: {
              display: 'inline-block', width: '7px', height: '7px',
              borderRadius: '50%',
              background: i === phase ? '#0a0a0a' : '#d8d8d0',
              transition: 'background 0.3s'
            }
          })
        )
      ),

      // ── Scale stats (always visible) ───────────────────────────────────
      React.createElement('div',
        { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginTop: '1.4rem' } },
        [
          { lbl: 'n ofertas',    v: '10.000',    sub: 'catálogo de referencia',  c: '#1e3a8a' },
          { lbl: 'd₁ × d₂',      v: '120 × 120', sub: 'ventana media en días',   c: '#d97706' },
          { lbl: 'filas en RAM', v: '144 M',     sub: 'O(n · d₁ · d₂) ≈ 9.8 GB', c: '#991b1b' },
        ].map(({ lbl, v, sub, c }) =>
          React.createElement('div', {
            key: lbl,
            style: {
              background: 'white', border: '1px solid #ebeae3',
              borderTop: `3px solid ${c}`, padding: '0.7rem 0.85rem',
              transition: 'transform 0.25s, box-shadow 0.25s'
            }
          },
            React.createElement('div', {
              style: {
                fontSize: '0.58rem', textTransform: 'uppercase',
                color: '#8a8a82', letterSpacing: '0.1em', fontWeight: '600'
              }
            }, lbl),
            React.createElement('div', {
              style: {
                fontSize: '1.35rem', fontWeight: '900',
                color: c, lineHeight: '1.2',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '-0.02em'
              }
            }, v),
            React.createElement('div', {
              style: { fontSize: '0.6rem', color: '#8a8a82', fontStyle: 'italic', fontFamily: 'EB Garamond, serif' }
            }, sub)
          )
        )
      )
    )
  );
};
// ── Fig 5 — Saturación del sistema bajo el modelo naive ────────────────────
// Dashboard de telemetría que reconstruye el comportamiento de la primera
// iteración (pandas) corriendo el cotejo con n=10.000 y d₁=d₂=120 días.

const FigOverload = () => {
  const [ref, visible] = useInView(0.15);
  const [t, setT] = useState(0);  // 0..100  ─ progreso simulado del run

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setT(x => (x >= 110 ? 0 : x + 2)), 200);
    return () => clearInterval(id);
  }, [visible]);

  // Curvas de telemetría (reconstruidas a partir del comportamiento real
  // observado en la iteración pandas: RAM crece lineal con la explosión
  // cartesiana, SWAP entra al 70 %, CPU sostiene 100 % desde t=15).
  const ram  = Math.min(100, t * 1.05);
  const cpu  = t > 8 ? 100 : t * 12;
  const swap = t > 70 ? Math.min(95, (t - 70) * 4) : 0;
  const io   = t > 70 ? 80 + Math.sin(t * 0.5) * 12 : 30 + Math.sin(t * 0.3) * 18;
  const oomTriggered = ram >= 100;

  const barColor = pct =>
    pct >= 90 ? '#991b1b' : pct >= 70 ? '#92400e' : pct >= 40 ? '#d97706' : '#15803d';

  const W = 720, H = 360;

  // ─ Dashboard frame ─────────────────────────────────────────────────────
  const Frame = () => React.createElement('g', null,
    React.createElement('rect', {
      x: 0, y: 0, width: W, height: H, rx: 4,
      fill: '#0a0a0a', stroke: '#1f1f1c', strokeWidth: 1
    }),
    // Top bar
    React.createElement('rect', {
      x: 0, y: 0, width: W, height: 28,
      fill: '#1f1f1c'
    }),
    React.createElement('circle', { cx: 14, cy: 14, r: 4, fill: oomTriggered ? '#991b1b' : '#15803d',
      style: oomTriggered ? { animation: 'pulse-red 1s infinite' } : {} }),
    React.createElement('text', {
      x: 28, y: 18,
      fontSize: '9.5', fontWeight: '700', fill: '#fafaf7',
      letterSpacing: '0.14em', fontFamily: 'JetBrains Mono, monospace'
    }, 'MONITOR DE SISTEMA · MODELO NAIVE · pandas v1.0'),
    React.createElement('text', {
      x: W - 14, y: 18, textAnchor: 'end',
      fontSize: '9', fontWeight: '600', fill: '#8a8a82',
      fontFamily: 'JetBrains Mono, monospace'
    }, oomTriggered ? '⚠ KERNEL OOM-KILLER ACTIVADO' : `t = ${(t * 7.2).toFixed(0)} s · run en curso`)
  );

  // ─ Vertical bar gauge ──────────────────────────────────────────────────
  const Gauge = ({ x, label, value, unit, peak }) => {
    const barH = 200, barX = x, barY = 70;
    const fillH = (value / 100) * barH;
    const c = barColor(value);
    return React.createElement('g', null,
      // Label
      React.createElement('text', {
        x: barX + 36, y: barY - 12, textAnchor: 'middle',
        fontSize: '8.5', fontWeight: '700', fill: '#8a8a82',
        letterSpacing: '0.12em', fontFamily: 'JetBrains Mono, monospace'
      }, label),
      // Track
      React.createElement('rect', {
        x: barX, y: barY,
        width: 72, height: barH, rx: 2,
        fill: '#1f1f1c', stroke: '#2a2a25', strokeWidth: 1
      }),
      // Grid lines
      ...[0.25, 0.5, 0.75].map(f =>
        React.createElement('line', {
          key: f,
          x1: barX, x2: barX + 72,
          y1: barY + (1 - f) * barH, y2: barY + (1 - f) * barH,
          stroke: '#2a2a25', strokeWidth: 1, strokeDasharray: '2,2'
        })
      ),
      // 90% danger line
      React.createElement('line', {
        x1: barX - 4, x2: barX + 76,
        y1: barY + 0.1 * barH, y2: barY + 0.1 * barH,
        stroke: '#991b1b', strokeWidth: 1, strokeDasharray: '4,2'
      }),
      React.createElement('text', {
        x: barX - 6, y: barY + 0.1 * barH + 3, textAnchor: 'end',
        fontSize: '6.5', fill: '#991b1b', fontWeight: '700',
        fontFamily: 'JetBrains Mono, monospace'
      }, '90'),
      // Fill
      React.createElement('rect', {
        x: barX, y: barY + barH - fillH,
        width: 72, height: fillH,
        fill: c, opacity: 0.85,
        style: {
          transition: 'height 0.25s linear, y 0.25s linear, fill 0.4s'
        }
      }),
      // Value
      React.createElement('text', {
        x: barX + 36, y: barY + barH + 22, textAnchor: 'middle',
        fontSize: '17', fontWeight: '900', fill: c,
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '-0.02em',
        style: { transition: 'fill 0.4s' }
      }, `${value.toFixed(0)}${unit}`),
      // Peak ref
      peak && React.createElement('text', {
        x: barX + 36, y: barY + barH + 36, textAnchor: 'middle',
        fontSize: '7', fill: '#8a8a82', fontStyle: 'italic',
        fontFamily: 'EB Garamond, serif'
      }, `pico: ${peak}`)
    );
  };

  // ─ Side log ───────────────────────────────────────────────────────────
  const logs = [
    { at: 5,   c: '#8a8a82', txt: '> reading source.xlsx (pandas + openpyxl)' },
    { at: 12,  c: '#8a8a82', txt: '> reading dest.csv ...........  done' },
    { at: 22,  c: '#d97706', txt: '> melt(): pivot wide → long' },
    { at: 35,  c: '#d97706', txt: '> explode(BW)  →  3.6e6 rows' },
    { at: 50,  c: '#92400e', txt: '> explode(TP)  →  1.4e8 rows' },
    { at: 70,  c: '#92400e', txt: '⚠ memory pressure: swapping' },
    { at: 85,  c: '#991b1b', txt: '⚠ join() allocating intermediate buffer' },
    { at: 95,  c: '#991b1b', txt: '⚠ MemoryError raised in worker' },
    { at: 100, c: '#991b1b', txt: '✗ killed (OOM-killer · signal 9)' },
  ];
  const visibleLogs = logs.filter(l => t >= l.at);

  return React.createElement('div', { ref, style: { fontFamily: 'JetBrains Mono, monospace' } },
    // Inline keyframes for the alert pulse
    React.createElement('style', null,
      `@keyframes pulse-red { 0%,100%{opacity:1} 50%{opacity:0.35} }
       @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-1px)} 75%{transform:translateX(1px)} }`
    ),

    React.createElement('svg', {
      width: '100%', viewBox: `0 0 ${W} ${H}`,
      style: { overflow: 'visible', borderRadius: 4 }
    },
      React.createElement(Frame),

      // Four gauges
      React.createElement(Gauge, { x: 28,  label: 'RAM',  value: ram,  unit: '%', peak: '9.8 GB / 16' }),
      React.createElement(Gauge, { x: 122, label: 'CPU',  value: cpu,  unit: '%', peak: '8 cores @ 100%' }),
      React.createElement(Gauge, { x: 216, label: 'SWAP', value: swap, unit: '%', peak: 'thrashing' }),
      React.createElement(Gauge, { x: 310, label: 'I/O',  value: io,   unit: '%', peak: 'spike pattern' }),

      // Right panel — log
      React.createElement('rect', {
        x: 410, y: 56, width: 290, height: 232, rx: 3,
        fill: '#1f1f1c', stroke: '#2a2a25', strokeWidth: 1
      }),
      React.createElement('text', {
        x: 422, y: 73,
        fontSize: '8', fontWeight: '700', fill: '#8a8a82',
        letterSpacing: '0.12em'
      }, 'STDERR · STREAM EN VIVO'),
      React.createElement('line', {
        x1: 410, y1: 80, x2: 700, y2: 80,
        stroke: '#2a2a25', strokeWidth: 1
      }),
      ...visibleLogs.slice(-9).map((l, i) =>
        React.createElement('text', {
          key: `log-${l.at}`,
          x: 422, y: 96 + i * 22,
          fontSize: '8.5', fill: l.c,
          fontFamily: 'JetBrains Mono, monospace',
          style: l.c === '#991b1b' ? { animation: 'pulse-red 1.4s infinite' } : {}
        }, l.txt)
      ),

      // Result banner at bottom
      oomTriggered && React.createElement('g', { style: { animation: 'pulse-red 1.5s infinite' } },
        React.createElement('rect', {
          x: 0, y: H - 36, width: W, height: 36,
          fill: '#991b1b'
        }),
        React.createElement('text', {
          x: W / 2, y: H - 14, textAnchor: 'middle',
          fontSize: '11', fontWeight: '900', fill: 'white',
          letterSpacing: '0.1em'
        }, '✗  PROCESO INTERRUMPIDO  ·  EJECUCIÓN INVIABLE EN HARDWARE DE EQUIPO  ·  MEMORIA SATURADA')
      ),

      !oomTriggered && React.createElement('g', null,
        React.createElement('rect', {
          x: 0, y: H - 36, width: W, height: 36,
          fill: '#1f1f1c'
        }),
        React.createElement('text', {
          x: 14, y: H - 14,
          fontSize: '9', fontWeight: '700', fill: '#fafaf7',
          letterSpacing: '0.08em'
        }, `RUN EN CURSO · ${(100 - ram).toFixed(0)}% RAM disponible · proyección: OOM en ${Math.max(0, ((100 - ram) / 1.05 * 0.2)).toFixed(1)} s`)
      )
    ),

    React.createElement('p', {
      style: {
        fontSize: '0.62rem', color: '#8a8a82', marginTop: '0.5rem',
        fontFamily: 'EB Garamond, serif', fontStyle: 'italic'
      }
    },
      'Telemetría reconstruida a partir de la primera iteración (pandas, máquina de equipo de 16 GB). El crecimiento lineal de RAM es directa consecuencia de materializar 1,44 × 10⁸ filas tras los dos ',
      React.createElement('code', { style: { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem' } }, 'explode()'),
      '. El kernel intercepta el proceso antes de poder ejecutar el join.'
    )
  );
};
// ── Fig 4 — Árbol de Intervalos Aumentado: animación de consulta con poda ──
// Vista doble: barra numérica arriba muestra los intervalos en el eje;
// árbol BST abajo muestra la estructura con la propiedad max aumentada.
// La animación recorre el árbol respondiendo a la consulta q = [10, 20].

const Fig4 = () => {
  const [step, setStep] = useState(-1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setStep(s => (s >= 9 ? -1 : s + 1)), 1100);
    return () => clearInterval(t);
  }, [paused]);

  // ── Tree nodes (BST ordered by interval lower endpoint l) ────────────────
  const nodes = [
    { id: 0, x: 230, y: 250, iv: [8,  22], m: 28 },
    { id: 1, x: 120, y: 315, iv: [3,  12], m: 18 },
    { id: 2, x: 340, y: 315, iv: [16, 28], m: 28 },
    { id: 3, x: 58,  y: 380, iv: [1,  6],  m: 6  },
    { id: 4, x: 182, y: 380, iv: [9,  18], m: 18 },
    { id: 5, x: 280, y: 380, iv: [14, 22], m: 22 },
    { id: 6, x: 402, y: 380, iv: [20, 28], m: 28 },
  ];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];

  // Query q = [10, 20]
  const Q = [10, 20];
  const visitSeq = [0, 1, 4, 2, 5];   // Order in which nodes are visited
  const pruned   = [3, 6];
  const hits     = [4, 5];

  const nodeState = id => {
    if (step < 0) return 'idle';
    const vi = visitSeq.indexOf(id);
    const visited = vi !== -1 && vi <= step;
    if (hits.includes(id) && visited) return 'hit';
    if (pruned.includes(id) && step >= visitSeq.length) return 'pruned';
    if (visited) return 'visited';
    return 'idle';
  };

  // State color palette (refined)
  const S = {
    idle:    { fill: '#fafaf7', stroke: '#d8d8d0', sw: 1,   tc: '#4a4a45' },
    visited: { fill: '#dbe4ff', stroke: '#1e3a8a', sw: 2.2, tc: '#1e3a8a' },
    hit:     { fill: '#d3f9d8', stroke: '#15803d', sw: 2.5, tc: '#15803d' },
    pruned:  { fill: '#ffe3e3', stroke: '#991b1b', sw: 1.8, tc: '#991b1b' },
  };

  const W = 460, SVGH = 458;
  const NLX0 = 36, NLX1 = 430, NLMIN = 0, NLMAX = 30;
  const NLY = 110;

  const nlX = v => NLX0 + ((v - NLMIN) / (NLMAX - NLMIN)) * (NLX1 - NLX0);
  const barRowY = i => NLY - 14 - i * 12;

  const idleColors = ['#5f3dc4','#1e3a8a','#5f3dc4','#8a8a82','#15803d','#92400e','#5f3dc4'];

  const stateColor = (id, st) => {
    if (st === 'hit')    return '#15803d';
    if (st === 'pruned') return '#991b1b';
    if (st === 'visited') return '#1e3a8a';
    return idleColors[id];
  };

  const stepLabels = [
    'Visito raíz [8,22]  ·  max=28 ≥ q_l=10  →  descender por ambos lados',
    'Visito izq [3,12]   ·  max=18 ≥ 10      →  descender por ambos lados',
    '[9,18] solapa con [10,20]  ✓  hit',
    'Vuelvo a la raíz  →  visito der [16,28]  →  descender',
    '[14,22] solapa con [10,20]  ✓  hit',
    '[1,6]:  max = 6 < q_l = 10  →  poda completa del subárbol  ✗',
    '[20,28]:  l = 20 ≤ q_h = 20  →  verificar nodo',
    'Búsqueda completa  →  k = 2 resultados (logarítmico)',
    'Búsqueda completa  →  k = 2 resultados (logarítmico)',
    'Búsqueda completa  →  k = 2 resultados (logarítmico)',
  ];

  const descText = step >= 0
    ? stepLabels[Math.min(step, stepLabels.length - 1)]
    : 'q = [10, 20]  ·  click para pausar / reanudar';

  return React.createElement('div',
    {
      style: { cursor: 'pointer', userSelect: 'none' },
      onClick: () => setPaused(p => !p),
      title: 'Click para pausar / reanudar',
    },
    React.createElement('svg',
      { width: '100%', viewBox: `0 0 ${W} ${SVGH}`, style: { fontFamily: 'JetBrains Mono, monospace', overflow: 'visible' } },

      // ── Section header: number line ─────────────────────────────────────
      React.createElement('text', {
        x: NLX0, y: 14, fontSize: '7.5', fontWeight: '700',
        fill: '#8a8a82', letterSpacing: '0.14em'
      }, 'INTERVALOS ALMACENADOS · EJE NUMÉRICO'),

      // Interval bars
      ...nodes.map((n, i) => {
        const st = nodeState(n.id);
        const c  = stateColor(n.id, st);
        const y  = barRowY(i);
        const x1 = nlX(n.iv[0]), x2 = nlX(n.iv[1]);
        const isActive = st !== 'idle';
        const sw = isActive ? 5 : 2.5;
        return React.createElement('g', { key: `iv${i}` },
          React.createElement('line', {
            x1, y1: y, x2, y2: y,
            stroke: c, strokeWidth: sw, strokeLinecap: 'round',
            opacity: isActive ? 1 : 0.42,
            style: { transition: 'stroke 0.3s, stroke-width 0.25s, opacity 0.3s' }
          }),
          React.createElement('circle', {
            cx: x1, cy: y, r: isActive ? 4 : 2.5,
            fill: c, opacity: isActive ? 1 : 0.42,
            style: { transition: 'r 0.25s, opacity 0.3s' }
          }),
          React.createElement('circle', {
            cx: x2, cy: y, r: isActive ? 4 : 2.5,
            fill: c, opacity: isActive ? 1 : 0.42,
            style: { transition: 'r 0.25s, opacity 0.3s' }
          }),
          React.createElement('text', {
            x: NLX0 - 5, y: y + 3.2,
            textAnchor: 'end', fontSize: '6.5',
            fill: c, opacity: isActive ? 1 : 0.5,
            fontWeight: '600'
          }, `n${i}`),
        );
      }),

      // Number line axis
      React.createElement('line', {
        x1: NLX0, y1: NLY, x2: NLX1, y2: NLY,
        stroke: '#4a4a45', strokeWidth: '1.5'
      }),
      ...[0, 5, 10, 15, 20, 25, 30].map(v =>
        React.createElement('g', { key: `tick${v}` },
          React.createElement('line', {
            x1: nlX(v), y1: NLY - 3, x2: nlX(v), y2: NLY + 5,
            stroke: '#4a4a45', strokeWidth: '1'
          }),
          React.createElement('text', {
            x: nlX(v), y: NLY + 14,
            textAnchor: 'middle', fontSize: '7.5', fill: '#8a8a82'
          }, v)
        )
      ),

      // Query range highlight
      step >= 0 && React.createElement('g', null,
        React.createElement('rect', {
          x: nlX(Q[0]), y: 18,
          width: nlX(Q[1]) - nlX(Q[0]),
          height: NLY - 18,
          fill: '#dbe4ff', fillOpacity: 0.35,
          stroke: '#1e3a8a', strokeWidth: '1.3', strokeDasharray: '5,3',
          rx: 2
        }),
        React.createElement('text', {
          x: (nlX(Q[0]) + nlX(Q[1])) / 2, y: NLY + 26,
          textAnchor: 'middle', fontSize: '7.5',
          fill: '#1e3a8a', fontWeight: '700'
        }, 'q = [10, 20]')
      ),

      // Divider
      React.createElement('line', {
        x1: 0, y1: 142, x2: W, y2: 142,
        stroke: '#ebeae3', strokeWidth: '1', strokeDasharray: '4,4'
      }),
      React.createElement('text', {
        x: NLX0, y: 158, fontSize: '7.5', fontWeight: '700',
        fill: '#8a8a82', letterSpacing: '0.14em'
      }, 'BST AUMENTADO · ORDENADO POR EXTREMO INFERIOR'),

      // BST edges
      ...edges.map(([a, b]) => {
        const na = nodes[a], nb = nodes[b];
        return React.createElement('line', {
          key: `e${a}${b}`,
          x1: na.x, y1: na.y + 26,
          x2: nb.x, y2: nb.y - 26,
          stroke: '#d8d8d0', strokeWidth: '1.2'
        });
      }),

      // BST nodes
      ...nodes.map(n => {
        const st = nodeState(n.id);
        const { fill, stroke, sw, tc } = S[st];
        const isHit    = st === 'hit';
        const isPruned = st === 'pruned';
        return React.createElement('g', { key: `n${n.id}` },
          React.createElement('rect', {
            x: n.x - 46, y: n.y - 26,
            width: 92, height: 52, rx: 4,
            fill, stroke, strokeWidth: sw,
            style: {
              transition: 'fill 0.35s, stroke 0.3s, stroke-width 0.2s',
              filter: isHit ? 'drop-shadow(0 0 6px rgba(21,128,61,0.45))' : 'none'
            }
          }),
          React.createElement('text', {
            x: n.x, y: n.y - 8, textAnchor: 'middle',
            fontSize: '10.5', fontWeight: '700', fill: tc
          }, `[${n.iv[0]}, ${n.iv[1]}]`),
          React.createElement('text', {
            x: n.x, y: n.y + 6, textAnchor: 'middle',
            fontSize: '8', fill: '#8a8a82'
          }, `max = ${n.m}`),
          (isHit || isPruned) && React.createElement('text', {
            x: n.x, y: n.y + 20, textAnchor: 'middle',
            fontSize: '8.5', fontWeight: '700',
            fill: isHit ? '#15803d' : '#991b1b'
          }, isHit ? '✓ hit' : '✗ poda'),
        );
      }),

      // Legend
      React.createElement('rect', {
        x: W - 122, y: 156,
        width: 118, height: 64, rx: 2,
        fill: 'white', stroke: '#d8d8d0', strokeWidth: '1'
      }),
      ...[
        ['#dbe4ff','#1e3a8a','visitado'],
        ['#d3f9d8','#15803d','match (hit)'],
        ['#ffe3e3','#991b1b','podado (max < q_l)']
      ].map(([f, s, l], i) =>
        React.createElement('g', {
          key: l,
          transform: `translate(${W - 116}, ${164 + i * 18})`
        },
          React.createElement('rect', {
            width: 12, height: 10,
            fill: f, stroke: s, strokeWidth: '1.3', rx: 1
          }),
          React.createElement('text', {
            x: 16, y: 9, fontSize: '7.5', fill: '#1f1f1c'
          }, l)
        )
      ),

      // Step description bar
      React.createElement('rect', {
        x: 0, y: SVGH - 24,
        width: W, height: 24, rx: 2,
        fill: '#f5f4ee', stroke: '#ebeae3'
      }),
      React.createElement('text', {
        x: 12, y: SVGH - 8, fontSize: '8',
        fill: '#1f1f1c', fontStyle: 'italic',
        fontFamily: 'JetBrains Mono, monospace'
      }, descText),

      // Pause overlay
      paused && React.createElement('g', null,
        React.createElement('rect', {
          x: W / 2 - 36, y: 158, width: 72, height: 18, rx: 2,
          fill: '#0a0a0a', fillOpacity: 0.85
        }),
        React.createElement('text', {
          x: W / 2, y: 170, textAnchor: 'middle',
          fontSize: '8', fill: 'white', letterSpacing: '0.1em'
        }, '⏸ PAUSADO')
      )
    )
  );
};
// ── Fig 5 — Árbol de Intervalos 2D Anidado: BW (exterior) → TP (interior) ──
// Una consulta rectangular [bw_l, bw_h] × [tp_l, tp_h] procede en dos fases:
// (1) el árbol BW localiza nodos candidatos, (2) cada candidato lanza una
// sub-consulta en su árbol TP interior. Coste: O(log²n + k).

const Fig5 = () => {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setStep(s => (s + 1) % 4), 2500);
    return () => clearInterval(t);
  }, [paused]);

  const phases = [
    { desc: 'Fase 1 · Consulta en eje BW: localizar nodos candidatos', hl: 'bw' },
    { desc: 'Fase 2 · Candidato BW[4–7]: sub-consulta en eje TP',      hl: 'tp1' },
    { desc: 'Fase 3 · Candidato BW[8–11]: sub-consulta en eje TP',     hl: 'tp2' },
    { desc: 'Fase 4 · Unión de resultados  →  O(log²n + k)',           hl: 'done' },
  ];

  const hl = phases[step].hl;

  // ── BW tree (left) ───────────────────────────────────────────────────────
  const NW = 56, NH = 28;

  const bwNodes = [
    { id: 0, x: 130, y: 36,  lbl: 'BW [1–15]' },
    { id: 1, x: 65,  y: 92,  lbl: 'BW [1–7]' },
    { id: 2, x: 195, y: 92,  lbl: 'BW [8–15]' },
    { id: 3, x: 22,  y: 150, lbl: 'BW [1–3]' },
    { id: 4, x: 90,  y: 150, lbl: 'BW [4–7]' },
    { id: 5, x: 162, y: 150, lbl: 'BW [8–11]' },
    { id: 6, x: 234, y: 150, lbl: 'BW [12–15]' },
  ];

  const bwEdges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];

  const bwActive = {
    bw:   [0, 1, 2, 4, 5],
    tp1:  [4],
    tp2:  [5],
    done: [4, 5],
  }[hl] || [];

  // ── TP sub-trees (right) ─────────────────────────────────────────────────
  const TPW = 54, TPH = 26;

  const tp1Nodes = [
    { x: 400, y: 46,  lbl: 'TP [1–16]' },
    { x: 355, y: 96,  lbl: 'TP [1–8]' },
    { x: 445, y: 96,  lbl: 'TP [9–16]' },
  ];
  const tp1Edges = [[400,46, 355,96], [400,46, 445,96]];

  const tp2Nodes = [
    { x: 400, y: 164, lbl: 'TP [1–12]' },
    { x: 355, y: 214, lbl: 'TP [1–6]' },
    { x: 445, y: 214, lbl: 'TP [7–12]' },
  ];
  const tp2Edges = [[400,164, 355,214], [400,164, 445,214]];

  const W = 490, H = 270;

  // BW node renderer
  const bwNode = n => {
    const active = bwActive.includes(n.id);
    return React.createElement('g', { key: `bw${n.id}` },
      React.createElement('rect', {
        x: n.x - NW/2, y: n.y - NH/2,
        width: NW, height: NH, rx: 3,
        fill: active ? '#dbe4ff' : '#fafaf7',
        stroke: active ? '#1e3a8a' : '#d8d8d0',
        strokeWidth: active ? 2 : 1,
        style: { transition: 'fill 0.4s, stroke 0.4s, stroke-width 0.4s' }
      }),
      React.createElement('text', {
        x: n.x, y: n.y + 4, textAnchor: 'middle',
        fontSize: '7.5', fontWeight: active ? '700' : '500',
        fill: active ? '#1e3a8a' : '#1f1f1c',
        style: { transition: 'fill 0.4s' }
      }, n.lbl)
    );
  };

  // TP node renderer
  const tpNode = (n, prefix) =>
    React.createElement('g', { key: `${prefix}${n.lbl}` },
      React.createElement('rect', {
        x: n.x - TPW/2, y: n.y - TPH/2,
        width: TPW, height: TPH, rx: 3,
        fill: '#d3f9d8', stroke: '#15803d', strokeWidth: '1.5'
      }),
      React.createElement('text', {
        x: n.x, y: n.y + 3.5, textAnchor: 'middle',
        fontSize: '7.5', fill: '#15803d', fontWeight: '600'
      }, n.lbl)
    );

  const tpEdge = ([x1, y1, x2, y2], i, prefix) =>
    React.createElement('line', {
      key: `${prefix}e${i}`,
      x1, y1: y1 + TPH/2,
      x2, y2: y2 - TPH/2,
      stroke: '#a3e9a4', strokeWidth: '1.2'
    });

  return React.createElement('div',
    { onClick: () => setPaused(p => !p), style: { cursor: 'pointer', userSelect: 'none' }, title: 'Click para pausar / reanudar' },

    React.createElement('div', {
      style: {
        fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace',
        color: '#1f1f1c', marginBottom: '0.85rem',
        background: '#f5f4ee', padding: '0.5rem 0.95rem',
        borderLeft: '3px solid #0a0a0a', letterSpacing: '0.04em'
      }
    }, phases[step].desc),

    React.createElement('svg',
      { width: '100%', viewBox: `0 0 ${W} ${H}`, style: { fontFamily: 'JetBrains Mono, monospace', overflow: 'visible' } },

      // BW label
      React.createElement('text', {
        x: 6, y: 14, fontSize: '8.5', fontWeight: '700',
        fill: '#1e3a8a', letterSpacing: '0.06em'
      }, 'ÁRBOL BW · EXTERIOR'),

      // BW edges
      ...bwEdges.map(([a, b]) => {
        const na = bwNodes[a], nb = bwNodes[b];
        return React.createElement('line', {
          key: `be${a}${b}`,
          x1: na.x, y1: na.y + NH/2,
          x2: nb.x, y2: nb.y - NH/2,
          stroke: '#e8e7df', strokeWidth: '1.4'
        });
      }),

      // BW nodes
      ...bwNodes.map(bwNode),

      // Connector arrow BW → TP
      step >= 1 && React.createElement('g', null,
        React.createElement('defs', null,
          React.createElement('marker', {
            id: 'arrow5', viewBox: '0 0 10 10',
            refX: 9, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto'
          },
            React.createElement('path', { d: 'M0,0 L10,5 L0,10 Z', fill: '#4a4a45' })
          )
        ),
        React.createElement('line', {
          x1: 270, y1: 132, x2: 310, y2: 132,
          stroke: '#4a4a45', strokeWidth: '2',
          markerEnd: 'url(#arrow5)', strokeDasharray: '4,3'
        }),
        React.createElement('text', {
          x: 290, y: 124, textAnchor: 'middle',
          fontSize: '7', fill: '#4a4a45', fontStyle: 'italic'
        }, 'sub-query')
      ),

      // TP sub-tree 1
      (hl === 'tp1' || hl === 'done') && React.createElement('g', { className: 'svg-fade-in' },
        React.createElement('text', {
          x: 400, y: 26, textAnchor: 'middle',
          fontSize: '8', fontWeight: '700', fill: '#15803d',
          letterSpacing: '0.04em'
        }, 'SUB-ÁRBOL TP · BW[4–7]'),
        ...tp1Edges.map((e, i) => tpEdge(e, i, 'tp1')),
        ...tp1Nodes.map(n => tpNode(n, 'tp1'))
      ),

      // TP sub-tree 2
      (hl === 'tp2' || hl === 'done') && React.createElement('g', { className: 'svg-fade-in' },
        React.createElement('text', {
          x: 400, y: 146, textAnchor: 'middle',
          fontSize: '8', fontWeight: '700', fill: '#15803d',
          letterSpacing: '0.04em'
        }, 'SUB-ÁRBOL TP · BW[8–11]'),
        ...tp2Edges.map((e, i) => tpEdge(e, i, 'tp2')),
        ...tp2Nodes.map(n => tpNode(n, 'tp2'))
      ),

      // Divider between TP trees
      hl === 'done' && React.createElement('line', {
        x1: 330, y1: 132, x2: 470, y2: 132,
        stroke: '#e8e7df', strokeWidth: '0.8', strokeDasharray: '3,3'
      }),

      // Result badge
      hl === 'done' && React.createElement('g', { className: 'svg-fade-in' },
        React.createElement('rect', {
          x: W/2 - 100, y: H - 38,
          width: 200, height: 24, rx: 3,
          fill: '#0a0a0a'
        }),
        React.createElement('text', {
          x: W/2, y: H - 22, textAnchor: 'middle',
          fontSize: '9', fontWeight: '700', fill: 'white',
          letterSpacing: '0.04em'
        }, 'k coincidencias  ·  O(log²n + k)')
      ),

      // Step dots
      ...[0, 1, 2, 3].map(i =>
        React.createElement('circle', {
          key: `sd5${i}`,
          cx: W/2 - 21 + i * 14, cy: H - 6, r: 3.5,
          fill: i === step ? '#0a0a0a' : '#d8d8d0',
          style: { transition: 'fill 0.3s' }
        })
      ),

      // TP section label
      step >= 1 && React.createElement('text', {
        x: 326, y: 14, fontSize: '8', fontWeight: '700',
        fill: '#15803d', letterSpacing: '0.06em'
      }, 'EJE TP · INTERIOR'),

      // Pause overlay
      paused && React.createElement('g', null,
        React.createElement('rect', {
          x: W/2 - 36, y: H/2 - 10, width: 72, height: 18, rx: 2,
          fill: '#0a0a0a', fillOpacity: 0.85
        }),
        React.createElement('text', {
          x: W/2, y: H/2 + 2, textAnchor: 'middle',
          fontSize: '8', fill: 'white', letterSpacing: '0.1em'
        }, '⏸ PAUSADO')
      )
    )
  );
};
// ── Fig 6 — Comparativa de complejidad (barras animadas) ────────────────────
// Barras normalizadas sobre el modelo naive: muestra el factor de reducción
// en espacio y tiempo del Árbol de Intervalos 2D vs. el modelo naive.

const Fig6 = () => {
  const [ref, visible] = useInView(0.2);
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (visible) setTimeout(() => setGo(true), 200);
  }, [visible]);

  const rows = [
    { label: 'Espacio · Naive',          pct: 100, note: 'O(n · d₁ · d₂)', c: '#991b1b' },
    { label: 'Espacio · Interval Tree',  pct: 4,   note: 'O(n log n)',     c: '#15803d' },
    { label: 'Consulta · Naive',         pct: 100, note: 'O(n · d)',       c: '#991b1b' },
    { label: 'Consulta · Interval Tree', pct: 5,   note: 'O(log²n + k)',   c: '#15803d' },
    { label: 'Construcción · Tree',      pct: 18,  note: 'O(n log²n)',     c: '#1e3a8a' },
  ];

  return React.createElement('div',
    { ref, style: { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.74rem' } },

    ...rows.map((r, i) =>
      React.createElement('div', { key: r.label, style: { marginBottom: '0.85rem' } },

        React.createElement('div', {
          style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }
        },
          React.createElement('span', {
            style: { color: '#1f1f1c', fontWeight: r.pct < 20 ? '700' : '500', letterSpacing: '0.02em' }
          }, r.label),
          React.createElement('span', {
            style: { color: '#8a8a82', fontStyle: 'italic', fontFamily: 'EB Garamond, serif', fontSize: '0.84rem' }
          }, r.note)
        ),

        React.createElement('div', {
          style: { height: '22px', background: '#ebeae3', borderRadius: '2px', overflow: 'hidden', position: 'relative' }
        },
          React.createElement('div', {
            style: {
              height: '100%', background: r.c,
              borderRadius: '2px',
              width: go ? `${r.pct}%` : '0%',
              transition: `width 1.4s cubic-bezier(0.22, 1, 0.36, 1) ${i * 140}ms`,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              paddingRight: '7px', overflow: 'hidden',
              boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.1)'
            }
          },
            go && r.pct > 15 && React.createElement('span', {
              style: { color: 'white', fontSize: '0.62rem', fontWeight: '700', whiteSpace: 'nowrap', letterSpacing: '0.04em' }
            }, `${r.pct}%`)
          )
        )
      )
    ),

    // Stat row: RAM comparison
    React.createElement('div', {
      style: { marginTop: '1.2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.7rem' }
    },
      [
        { lbl: 'RAM · Naive',         v: '~9.8 GB', c: '#991b1b' },
        { lbl: 'RAM · Interval Tree', v: '~85 MB',  c: '#15803d' },
        { lbl: 'Reducción',           v: '−99.1 %', c: '#0a0a0a' },
      ].map(({ lbl, v, c }) =>
        React.createElement('div', {
          key: lbl,
          style: {
            border: `2px solid ${c}`, padding: '0.55rem 0.8rem',
            textAlign: 'center', background: 'white',
            transition: 'transform 0.25s, box-shadow 0.25s'
          }
        },
          React.createElement('div', {
            style: {
              fontSize: '0.58rem', color: '#8a8a82',
              textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600'
            }
          }, lbl),
          React.createElement('div', {
            style: { fontSize: '1.18rem', fontWeight: '900', color: c, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }
          }, v)
        )
      )
    ),

    React.createElement('p', {
      style: {
        fontSize: '0.62rem', color: '#8a8a82', marginTop: '0.85rem',
        fontStyle: 'italic', fontFamily: 'EB Garamond, serif'
      }
    }, 'Escenario de referencia: n = 10.000 ofertas, d₁ = d₂ = 120 días, k ≈ 5 hits/consulta. Barras normalizadas sobre el modelo naive.')
  );
};

// ── Fig 7 — Tanques de memoria: visualización a escala ─────────────────────
// Comparación visual del consumo de RAM entre los dos modelos.

const Fig7 = () => {
  const [ref, visible] = useInView(0.2);
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (visible) setTimeout(() => setGo(true), 400);
  }, [visible]);

  const TANK_H = 160;

  const Tank = ({ label, ram, fillPct, color, time, model }) =>
    React.createElement('div',
      { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', flex: '1' } },

      React.createElement('div', {
        style: { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', fontWeight: '900', color, lineHeight: 1 }
      }, ram),

      React.createElement('div', {
        style: {
          width: '90px', height: `${TANK_H}px`,
          border: `2.5px solid ${color}`,
          borderRadius: '4px',
          position: 'relative',
          background: '#fafaf7',
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)'
        }
      },
        // Horizontal grid lines
        ...[0.25, 0.5, 0.75].map(f =>
          React.createElement('div', {
            key: f,
            style: {
              position: 'absolute',
              left: 0, right: 0,
              top: `${(1 - f) * 100}%`,
              borderTop: '1px dashed #ebeae3'
            }
          })
        ),
        // Fill
        React.createElement('div', {
          style: {
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: go ? `${fillPct}%` : '0%',
            background: `linear-gradient(180deg, ${color} 0%, ${color}dd 100%)`,
            opacity: 0.78,
            transition: `height 2s cubic-bezier(0.22, 1, 0.36, 1)`,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '7px',
          }
        },
          go && fillPct > 14 && React.createElement('span', {
            style: {
              color: 'white', fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem', fontWeight: '700',
              textAlign: 'center', lineHeight: 1.3
            }
          }, ram)
        )
      ),

      React.createElement('div', {
        style: {
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.75rem', color: '#1f1f1c',
          textAlign: 'center', fontWeight: '700', letterSpacing: '0.04em'
        }
      }, label),
      React.createElement('div', {
        style: {
          fontFamily: 'EB Garamond, serif', fontStyle: 'italic',
          fontSize: '0.7rem', color: '#8a8a82', textAlign: 'center'
        }
      }, model),
      React.createElement('div', {
        style: {
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem', color: '#4a4a45', textAlign: 'center',
          marginTop: '2px'
        }
      }, time)
    );

  return React.createElement('div', { ref },

    React.createElement('div', {
      style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3.5rem', padding: '0.5rem 0 0.85rem' }
    },
      React.createElement(Tank, {
        label: 'Naive', model: 'O(n · d₁ · d₂)',
        ram: '9.8 GB', fillPct: 92, color: '#991b1b', time: '~ 18 min'
      }),

      React.createElement('div', {
        style: {
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '1.4rem', fontWeight: '900',
          color: '#d8d8d0', alignSelf: 'center',
          paddingBottom: `${TANK_H * 0.32}px`
        }
      }, 'vs'),

      React.createElement(Tank, {
        label: 'Interval Tree', model: 'O(n log n)',
        ram: '85 MB', fillPct: 0.8, color: '#15803d', time: '< 30 seg'
      })
    ),

    React.createElement('div', {
      style: {
        display: 'flex', justifyContent: 'center', marginTop: '0.4rem',
        opacity: go ? 1 : 0, transition: 'opacity 0.7s 2s'
      }
    },
      React.createElement('div', {
        style: {
          background: '#0a0a0a', color: 'white',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.78rem', fontWeight: '700',
          padding: '5px 18px', borderRadius: '2px',
          letterSpacing: '0.06em'
        }
      }, '−99.1 % de RAM')
    )
  );
};
// ── App — modern editorial, single column ───────────────────────────────
const h = React.createElement;

// Progress bar
(() => {
  const update = () => {
    const el = document.documentElement;
    const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
    const f = document.getElementById('pfill');
    if (f) f.style.width = `${pct}%`;
  };
  window.addEventListener('scroll', update, { passive: true });
})();

// ── Components ──────────────────────────────────────────────────────────
const Sec = ({ id, n, title, children }) => {
  const [ref, visible] = useInView(0.08);
  return h('section', { id, ref, className: `sec${visible ? ' vis' : ''}` },
    h('div', { className: 'sec-head' },
      h('span', { className: 'sec-num' }, n),
      h('h2', { className: 'sec-title' }, title)
    ),
    h('div', { className: 'sec-body' }, children)
  );
};

const H3 = ({ n, children }) =>
  h('h3', { 'data-n': n }, children);

const Fig = ({ n, label, caption, children }) =>
  h('figure', { className: 'fig' },
    h('div', { className: 'fig-head' },
      h('span', { className: 'fig-n' }, `Fig. ${n}`),
      h('span', { className: 'fig-lbl' }, label)
    ),
    h('div', { className: 'fig-inner' }, children),
    caption && h('figcaption', { className: 'fig-cap' },
      h('strong', null, `Fig. ${n}.`), ' ', caption)
  );

const CB = ({ lang, badge, children }) =>
  h('div', { className: 'cb' },
    h('div', { className: 'cb-head' },
      h('span', { className: 'cb-lang' }, lang),
      badge && h('span', { className: 'cb-badge' }, badge)
    ),
    // Render code/content inside a styled in-document box instead of a console-like <pre>
    h('div', { className: 'cb-body', dangerouslySetInnerHTML: { __html: children } })
  );

const PQ = ({ children }) => h('blockquote', { className: 'pq' }, children);

// ── Code snippets ───────────────────────────────────────────────────────
const queryCode = `<span class="code-kw">def</span> <span class="code-fn">query_all</span>(node, q_l, q_h, results):
    <span class="code-kw">if</span> node <span class="code-kw">is</span> None:
        <span class="code-kw">return</span>
    <span class="code-comment"># Poda: ningún intervalo del subárbol puede solapar</span>
    <span class="code-kw">if</span> node.m < q_l:
        <span class="code-kw">return</span>
    <span class="code-comment"># Verificar el intervalo del nodo actual</span>
    <span class="code-kw">if</span> node.interval.l <= q_h <span class="code-kw">and</span> node.interval.h >= q_l:
        results.<span class="code-fn">append</span>(node.interval)
    <span class="code-comment"># Descender a ambos hijos</span>
    <span class="code-fn">query_all</span>(node.left,  q_l, q_h, results)
    <span class="code-fn">query_all</span>(node.right, q_l, q_h, results)`;

const pipelineCode = `<span class="code-comment"># Fase 1 · Construir el índice desde el sistema destino</span>
trees = {}
<span class="code-kw">for</span> (group_key, offers) <span class="code-kw">in</span> dst_df.<span class="code-fn">group_by</span>([<span class="code-str">"hotel"</span>, <span class="code-str">"room"</span>]):
    trees[group_key] = <span class="code-fn">IntervalTree2D</span>()
    <span class="code-kw">for</span> o <span class="code-kw">in</span> offers:
        trees[group_key].<span class="code-fn">insert</span>(bw=(o.bw_l, o.bw_h), tp=(o.tp_l, o.tp_h), payload=o)

<span class="code-comment"># Fase 2 · Consultar cada oferta del sistema origen</span>
results = []
<span class="code-kw">for</span> o_src <span class="code-kw">in</span> src_df.<span class="code-fn">iter_rows</span>():
    tree = trees.<span class="code-fn">get</span>((o_src.hotel, o_src.room))
    hits = tree.<span class="code-fn">query_2d</span>(o_src.bw_l, o_src.bw_h, o_src.tp_l, o_src.tp_h) <span class="code-kw">if</span> tree <span class="code-kw">else</span> []
    results.<span class="code-fn">append</span>(<span class="code-fn">evaluate</span>(o_src, hits))`;

const ingestCode = `<span class="code-comment"># Lectura heterogénea: origen en .xlsx, destino en .csv</span>
src_raw = <span class="code-fn">read_excel</span>(<span class="code-str">"origen.xlsx"</span>, engine=<span class="code-str">"calamine"</span>)
dst_raw = <span class="code-fn">read_csv</span>(<span class="code-str">"destino.csv"</span>, sep=<span class="code-str">";"</span>, encoding=<span class="code-str">"utf-8-sig"</span>)

<span class="code-comment"># Normalización: pivot ancho → largo, parseo multi-formato</span>
src_df = <span class="code-fn">normalize</span>(src_raw, schema=COMMON_SCHEMA)
dst_df = <span class="code-fn">normalize</span>(dst_raw, schema=COMMON_SCHEMA)`;

const nodeCode = `<span class="code-kw">@dataclass</span>(slots=<span class="code-kw">True</span>)
<span class="code-kw">class</span> <span class="code-fn">Node</span>:
    l: <span class="code-fn">int</span>                         <span class="code-comment"># extremo izquierdo  (ordinal de día)</span>
    h: <span class="code-fn">int</span>                         <span class="code-comment"># extremo derecho</span>
    m: <span class="code-fn">int</span>                         <span class="code-comment"># aumentación: max(h) del subárbol</span>
    payload: <span class="code-fn">Offer</span> | <span class="code-str">"Node"</span>          <span class="code-comment"># oferta (hoja) o raíz del árbol interior (2D)</span>
    left:  <span class="code-str">"Node | None"</span> = <span class="code-kw">None</span>
    right: <span class="code-str">"Node | None"</span> = <span class="code-kw">None</span>
    bf: <span class="code-fn">int</span> = 0                     <span class="code-comment"># factor de balanceo AVL ∈ {-1, 0, +1}</span>`;

const buildCode = `<span class="code-kw">def</span> <span class="code-fn">build</span>(ivs: <span class="code-fn">list</span>[<span class="code-fn">Interval</span>]) -> <span class="code-str">"Node | None"</span>:
    <span class="code-comment"># Construcción bottom-up perfectamente balanceada en O(n log n)</span>
    <span class="code-kw">if</span> <span class="code-kw">not</span> ivs:
        <span class="code-kw">return</span> <span class="code-kw">None</span>
    ivs.<span class="code-fn">sort</span>(key=<span class="code-kw">lambda</span> iv: iv.l)     <span class="code-comment"># O(n log n)</span>
    <span class="code-kw">return</span> <span class="code-fn">_build_rec</span>(ivs, 0, <span class="code-fn">len</span>(ivs) - 1)

<span class="code-kw">def</span> <span class="code-fn">_build_rec</span>(ivs, lo, hi):
    <span class="code-kw">if</span> lo > hi: <span class="code-kw">return</span> <span class="code-kw">None</span>
    mid = (lo + hi) >> 1
    n = <span class="code-fn">Node</span>(l=ivs[mid].l, h=ivs[mid].h, m=ivs[mid].h, payload=ivs[mid])
    n.left  = <span class="code-fn">_build_rec</span>(ivs, lo, mid - 1)
    n.right = <span class="code-fn">_build_rec</span>(ivs, mid + 1, hi)
    n.m = <span class="code-fn">max</span>(n.h,
              n.left.m  <span class="code-kw">if</span> n.left  <span class="code-kw">else</span> -MAXINT,
              n.right.m <span class="code-kw">if</span> n.right <span class="code-kw">else</span> -MAXINT)
    <span class="code-kw">return</span> n`;

const query2dCode = `<span class="code-kw">def</span> <span class="code-fn">query_2d</span>(outer, bw_l, bw_h, tp_l, tp_h):
    <span class="code-comment"># Exterior · O(log²n + k₁): candidatos cuya BW cruza [bw_l, bw_h]</span>
    candidates = <span class="code-fn">query_all</span>(outer, bw_l, bw_h, [])
    hits = []
    <span class="code-kw">for</span> node <span class="code-kw">in</span> candidates:
        <span class="code-comment"># Interior · O(log n + k₂): confirma solape en TP</span>
        <span class="code-kw">if</span> <span class="code-fn">query_any</span>(node.payload.tp_tree, tp_l, tp_h):
            hits.<span class="code-fn">append</span>(node.payload.offer)
    <span class="code-kw">return</span> hits   <span class="code-comment"># coste total: O(log²n + k)</span>`;

const MemFig = typeof Fig7 !== 'undefined' ? Fig7 : (typeof Fig6 !== 'undefined' ? Fig6 : null);

// ── App ────────────────────────────────────────────────────────────────
const App = () =>
  h(React.Fragment, null,
    // Topbar
    h('div', { className: 'topbar' },
      h('div', null, h('span', { className: 'dot' }), 'Caso de Estudio Interno'),
      h('div', { className: 'topbar-right' }, 'V 3.1  ·  17.04.2026')
    ),

    h('article', { className: 'paper' },

      // Hero
      h('header', { className: 'hero' },
        h('div', { className: 'hero-kicker' }, 'Data Engineering', h('span', null, '#01')),
        h('h1', { className: 'hero-title' },
          'Interval Trees ', h('em', null, '2D'), h('br'),
          'para conciliación comercial'
        ),
        h('p', { className: 'hero-sub' },
          'Un motor geométrico que indexa ofertas como rectángulos en ℝ² y elimina el muro de memoria —reducción empírica del consumo de RAM superior al 99 %.'
        ),
        h('div', { className: 'hero-meta' },
          h('div', { className: 'hero-meta-item' },
            h('div', { className: 'hero-meta-label' }, 'Autor'),
            h('div', { className: 'hero-meta-value' }, 'Nelson Ponce Luna')
          ),
          h('div', { className: 'hero-meta-item' },
            h('div', { className: 'hero-meta-label' }, 'Misión'),
            h('div', { className: 'hero-meta-value' }, 'Proyecto realizado por Nelson Ponce Luna — Data Science & Automation Developer')
          ),
          h('div', { className: 'hero-meta-item' },
            h('div', { className: 'hero-meta-label' }, 'Rol'),
            h('div', { className: 'hero-meta-value' }, 'Data Science & Automation')
          ),
          h('div', { className: 'hero-meta-item' },
            h('div', { className: 'hero-meta-label' }, 'Publicado'),
            h('div', { className: 'hero-meta-value' }, '17 abril 2026')
          ),
          h('div', { className: 'hero-meta-item' },
            h('div', { className: 'hero-meta-label' }, 'Lectura'),
            h('div', { className: 'hero-meta-value' }, '~ 18 min')
          )
        )
      ),

      // Abstract
      h('div', { className: 'abstract' },
        h('div', { className: 'abstract-label' }, '— Resumen'),
        h('p', { className: 'abstract-body' },
          'Este documento describe el proceso —desde la detección de la necesidad operativa hasta la implementación final— de un motor de conciliación de ofertas definidas por dos rangos temporales: ventana de reserva (',
          h('em', null, 'Booking Window'), ') y período de viaje (', h('em', null, 'Travel Period'),
          '). El proyecto recorrió tres iteraciones: un prototipo en pandas que colapsó la máquina; una segunda versión en Polars/calamine que recortó tiempo y memoria sin alterar la complejidad asintótica; y una tercera reformulación geométrica que indexa cada oferta como un rectángulo en ',
          h(M, { t: '\\mathbb{R}^2' }), ' mediante un Árbol de Intervalos Aumentado bidimensional, reduciendo la complejidad espacial a ',
          h(M, { t: 'O(n \\log n)' }), ' y el tiempo de consulta a ', h(M, { t: 'O(\\log^2 n + k)' }), '.'
        ),
        h('div', { className: 'abstract-kw' },
          ['Interval Tree', 'Augmented BST', '2D Range Query', 'Polars', 'Calamine', 'Complejidad Espacial', 'Pipelines'].map(k =>
            h('span', { key: k }, k)
          )
        )
      ),

      // I
      h(Sec, { id: 'I', n: '§ 01', title: 'Introducción y contexto operativo' },
        h('p', null,
          'En el ecosistema de sistemas de gestión de reservas, la conciliación entre ofertas definidas comercialmente y las finalmente publicadas es un proceso crítico. Una oferta se define por su producto, variante, descuento y dos ventanas temporales: la ',
          h('em', null, 'Booking Window'), ' (BW) y el ', h('em', null, 'Travel Period'), ' (TP).'
        ),
        h('p', null,
          'Es de vital importancia ', h('strong', null, 'cuidar que los datos estén bien publicados'),
          '. Un desfase en las fechas puede provocar que un producto se venda con el descuento equivocado, haciendo mandatorio un ',
          h('strong', null, 'cross check constante'), ' entre origen y destino. Sin conciliación automatizada, estos errores se materializan en severas ',
          h('strong', null, 'pérdidas económicas'), '.'
        ),
        h('p', null,
          'El reto no es la simple igualdad de atributos, sino la evaluación eficiente de los ',
          h('strong', null, 'solapamientos temporales bidimensionales'),
          ' a escala de catálogo completo.'
        )
      ),

      // II
      h(Sec, { id: 'II', n: '§ 02', title: 'Génesis: detección y tres iteraciones' },
        h(H3, { n: '2.1' }, 'Detección de la necesidad'),
        h('p', null,
          'El proyecto no nació como encargo formal sino como respuesta a una observación recurrente: las discrepancias se detectaban ', h('em', null, 'a posteriori'),
          ', cuando el cliente ya se había topado con un descuento incorrecto. La solución artesanal era lenta, parcial y propensa a error humano. ',
          h('strong', null, 'Hacía falta un sistema automatizado, exhaustivo y reproducible'),
          '. Lo asumí como iniciativa propia y lo construí en tres iteraciones sucesivas.'
        ),

        h(H3, { n: '2.2' }, 'Vista panorámica de las tres iteraciones'),
        h('p', null, 'La figura siguiente sintetiza el recorrido. Solo la tercera iteración modificó el régimen asintótico del problema.'),
        h(Fig, {
          n: '01', label: 'Evolución del motor · tres iteraciones',
          caption: h('span', null, h('strong', null, 'v1.0'), ' (pandas) reveló el problema; ',
            h('strong', null, 'v3.x'), ' (Polars) lo pospuso; ',
            h('strong', null, 'v5.x'), ' (Interval Tree 2D) lo eliminó.')
        }, h(FigJourney)),

        h(H3, { n: '2.3' }, 'Iteración 1 — Prototipo en pandas'),
        h('p', null,
          'El primer prototipo expandía cada oferta en una fila por día (', h('em', null, 'cartesian explode'),
          ') y resolvía la conciliación con un join exacto. Sobre el catálogo real la máquina entraba en swap, después en thrashing, y el kernel mataba el proceso. En entornos corporativos el equipo de desarrollo sufrió el colapso del PC corporativo al intentar ejecutar el proceso en producción.',
          ' La causa raíz fue estructural: el catálogo rebasaba los cien millones de filas antes de iniciar el join.'
        ),
        h(Fig, {
          n: '02', label: 'Discretización cartesiana: el origen del colapso',
          caption: h('span', null,
            'Una oferta con ventanas de 5×5 días produce 25 filas. Escalado al catálogo real, el DataFrame supera los ',
            h('strong', null, '144 millones'), ' de registros.')
        }, h(Fig3)),

        h(Fig, {
          n: '03', label: 'Saturación del sistema · telemetría reconstruida',
          caption: 'RAM, CPU, SWAP e I/O entran en zona crítica de forma escalonada hasta que el kernel intercepta el proceso.'
        }, h(FigOverload)),

        h(H3, { n: '2.4' }, 'Iteración 2 — Polars y calamine'),
        h('p', null,
          'Reescribí el pipeline en Polars (núcleo Rust, ', h('em', null, 'lazy evaluation'),
          ') y sustituí la lectura xlsx por calamine. El throughput se multiplicó por tres y la RAM cayó a ~9,8 GB. Pero la complejidad asintótica seguía siendo ',
          h(M, { t: 'O(n \\cdot d_1 \\cdot d_2)' }), ' — cualquier ampliación de ventana volvía a poner el sistema al borde del OOM. ',
          h('strong', null, 'Diagnóstico:'), ' optimizar el motor pospone el muro; no lo elimina.'
        ),

        h(H3, { n: '2.5' }, 'Iteración 3 — Árboles de intervalos'),
        h('p', null,
          'La tercera iteración fue un cambio de paradigma. Cada oferta era —geométricamente— un rectángulo en el plano BW × TP. Indexando los rectángulos en un Árbol de Intervalos Aumentado 2D, el coste espacial cayó a ',
          h(M, { t: 'O(n \\log n)' }), ' y el de consulta a ', h(M, { t: 'O(\\log^2 n + k)' }),
          '. El procesamiento completo se ejecuta en menos de 30 segundos consumiendo 85 MB de RAM, sobre la misma máquina donde la v1.0 había muerto.'
        ),

        h(PQ, null, '"Medir antes de optimizar y reformular antes de escalar. Cambiar el motor da rendimiento; cambiar la estructura de datos da viabilidad."')
      ),

      // III
      h(Sec, { id: 'III', n: '§ 03', title: 'Definición técnica del problema' },
        h('p', null,
          'Sea una oferta una tupla ',
          h(M, { t: 'O = (h, r, [bw_l, bw_h], [tp_l, tp_h], \\delta)' }),
          ' donde ', h(M, { t: 'h' }), ' identifica el producto, ', h(M, { t: 'r' }),
          ' la variante y ', h(M, { t: '\\delta \\in [0,1]' }),
          ' el descuento. Geométricamente, cada oferta es un rectángulo alineado con los ejes en ',
          h(M, { t: '\\mathbb{R}^2' }), '.'
        ),
        h(Fig, {
          n: '04', label: 'Representación geométrica de las fechas',
          caption: 'Cada oferta es un rectángulo en el plano BW × TP. La conciliación se reduce a búsqueda de intersecciones rectangulares.'
        }, h(Fig1)),
        h('p', null, 'Dos ofertas son ', h('em', null, 'compatibles'), ' si comparten producto y variante y sus rectángulos se solapan:'),
        h('div', { className: 'eq-block' },
          h(M, { t: '(h_s, r_s) = (h_d, r_d) \\;\\wedge\\; bw_l^{(s)} \\le bw_h^{(d)} \\;\\wedge\\; bw_l^{(d)} \\le bw_h^{(s)} \\;\\wedge\\; tp_l^{(s)} \\le tp_h^{(d)} \\;\\wedge\\; tp_l^{(d)} \\le tp_h^{(s)}', d: true })
        ),
        h('p', null,
          'Es un problema clásico de geometría computacional —', h('em', null, 'rectangle intersection'),
          '— estudiado por Edelsbrunner [3] y formalizado en de Berg et al. [2]. La conciliación se reduce a resolverlo eficientemente ',
          h('strong', null, 'sin materializar el producto cartesiano de las fechas'), '.'
        )
      ),

      // IV
      h(Sec, { id: 'IV', n: '§ 04', title: 'Arquitectura de la solución' },
        h('p', null, 'La arquitectura se organiza en dos fases: tratamiento de datos e indexación geométrica.'),

        h(H3, { n: '4.1' }, 'Fase A — Tratamiento de datos'),
        h('p', null,
          'Las fuentes llegan en formatos pesados (.xlsx y .csv). Se implementó ',
          h('strong', null, 'Polars + calamine'), ', garantizando lectura vectorizada y eficiente en memoria.'
        ),
        h('ul', null,
          h('li', null, h('strong', null, 'Pivot ancho → largo: '), 'un ', h('em', null, 'melt'), ' transforma cada columna-fecha en una fila por oferta-fecha.'),
          h('li', null, h('strong', null, 'Parseo universal: '), 'unificación de formatos y traducción a entero ordinal ',
            h(M, { t: '\\text{ord}(d)=(d-d_0).\\text{days}' }), '. Condición necesaria para aritmética entera en el árbol.'),
          h('li', null, h('strong', null, 'Mapeo y limpieza: '), 'unificación de códigos equivalentes y exclusión anticipada de registros irrelevantes.')
        ),
        h(CB, { lang: 'python', badge: 'ingestión' }, ingestCode),

        h(Fig, {
          n: '05', label: 'Pipeline: archivos → índice → reporte',
          caption: 'Cinco etapas: lectura, normalización, indexación en el árbol 2D, cotejo y exportación.'
        }, h(Fig2)),

        h(H3, { n: '4.2' }, 'Fase B — Árboles de intervalos aumentados'),
        h('p', null,
          'En lugar de expandir los días, se indexan los intervalos como rangos continuos mediante ',
          h('strong', null, 'Árboles de Intervalos Aumentados'), ' [1, 2]. Cada nodo almacena un intervalo ',
          h(M, { t: '[l,h]' }), ' y se aumenta con un campo ', h(M, { t: 'm' }),
          ' que mantiene el máximo extremo derecho de su subárbol:'
        ),
        h('div', { className: 'eq-block' },
          h(M, { t: 'm(v) = \\max\\bigl(v.h,\\; m(v.\\text{left}),\\; m(v.\\text{right})\\bigr)', d: true })
        ),
        h('p', null,
          'La estructura concreta del nodo —implementada en Python con ',
          h('code', { className: 'inline-code' }, '@dataclass(slots=True)'),
          ' para eliminar el ', h('code', { className: 'inline-code' }, '__dict__'),
          ' de cada instancia y compactar la huella en memoria— es la siguiente:'
        ),
        h(CB, { lang: 'python', badge: 'estructura del nodo' }, nodeCode),

        h('p', null,
          h('strong', null, 'Construcción estática. '),
          'Una inserción AVL o red-black convencional cuesta ', h(M, { t: 'O(\\log n)' }),
          ' por elemento pero amplifica la constante. Como el catálogo es estático dentro de cada ejecución, se construye el árbol ',
          h('em', null, 'bottom-up'), ': los intervalos se ordenan por extremo izquierdo y la mediana recursiva actúa como raíz. El resultado es un árbol perfectamente balanceado de altura ',
          h(M, { t: '\\lceil \\log_2 n \\rceil' }), ' en ', h(M, { t: 'O(n \\log n)' }),
          ' sin rotaciones, con propagación de ', h(M, { t: 'm(v)' }), ' durante el retorno de la recursión.'
        ),
        h(CB, { lang: 'python', badge: 'construcción bottom-up' }, buildCode),

        h('p', null,
          'La aumentación ', h(M, { t: 'm(v)' }), ' permite ',
          h('strong', null, 'podar subárboles enteros'),
          ' durante la consulta: si ', h(M, { t: 'm(v) < q_l' }),
          ', ningún intervalo del subárbol puede solapar con ', h(M, { t: '[q_l, q_h]' }), '.'
        ),
        h(CB, { lang: 'python', badge: 'consulta con poda' }, queryCode),

        h('div', { className: 'proof' },
          h('div', { className: 'proof-hd' }, 'Proposición · corrección de la poda'),
          h('p', { className: 'proof-bd' },
            'Sea ', h(M, { t: 'T_v' }), ' el subárbol enraizado en ', h(M, { t: 'v' }),
            '. Por inducción estructural sobre ', h(M, { t: 'T_v' }),
            ', la aumentación satisface ', h(M, { t: 'm(v) \\ge h(i) \\;\\; \\forall i \\in T_v' }),
            '. Si ', h(M, { t: 'm(v) < q_l' }),
            ', entonces ', h(M, { t: 'h(i) < q_l' }), ' para todo ', h(M, { t: 'i \\in T_v' }),
            ', lo que implica ', h(M, { t: '[l_i, h_i] \\cap [q_l, q_h] = \\emptyset' }),
            '. La rama se descarta sin pérdida. ',
            h('span', { className: 'qed' }, '∎')
          )
        ),

        h(Fig, {
          n: '06', label: 'Árbol de intervalos: consulta con poda',
          caption: h('span', null, 'Candidatos (azul), hits confirmados (verde), ramas descartadas (rojo) gracias a ',
            h(M, { t: 'm(v) < q_l' }), '.')
        }, h(Fig4)),

        h(H3, { n: '4.3' }, 'Extensión bidimensional: árbol anidado'),
        h('p', null,
          'Para cotejar BW y TP simultáneamente se extiende la estructura a un ',
          h('strong', null, 'árbol anidado 2D'), ' en el sentido de de Berg et al. [2, cap. 5]. El ',
          h('em', null, 'árbol exterior'), ' indexa los intervalos de BW; el ', h('em', null, 'payload'),
          ' de cada nodo exterior es un segundo árbol —el ', h('em', null, 'árbol interior'),
          '— que indexa los intervalos de TP de las ofertas asociadas. Cada intervalo aparece en ',
          h(M, { t: 'O(\\log n)' }),
          ' árboles interiores en el peor caso, por lo que el coste espacial total sube a ',
          h(M, { t: 'O(n \\log n)' }), '. La consulta compuesta ejecuta un recorrido exterior y delega en el interior por cada candidato:'
        ),
        h(CB, { lang: 'python', badge: 'consulta 2D' }, query2dCode),
        h('p', null,
          'La complejidad resultante —', h(M, { t: 'T(n) = O(\\log^2 n + k)' }),
          '— se obtiene por el argumento estándar de ', h('em', null, 'query path'),
          ': el exterior visita ', h(M, { t: 'O(\\log n)' }),
          ' nodos; cada interior cuesta ', h(M, { t: 'O(\\log n + k_v)' }),
          ' y ', h(M, { t: '\\sum_v k_v = k' }), '.'
        ),
        h(Fig, {
          n: '07', label: 'Consulta bidimensional en árbol anidado',
          caption: 'El árbol exterior localiza candidatos en BW. Para cada uno, el sub-árbol interior confirma TP.'
        }, h(Fig5)),

        h(H3, { n: '4.4' }, 'Alternativas consideradas'),
        h('p', null,
          'Antes de adoptar el árbol de intervalos aumentado se evaluaron cuatro estructuras. La decisión se tomó sobre coste de construcción, coste de consulta 2D, fricción de implementación y garantías en el peor caso —no esperado—.'
        ),
        h('div', { className: 'ptable-wrap' },
          h('table', { className: 'ptable' },
            h('thead', null,
              h('tr', null,
                h('th', null, 'Estructura'),
                h('th', null, 'Construcción'),
                h('th', null, 'Consulta 2D'),
                h('th', null, 'Motivo de descarte')
              )
            ),
            h('tbody', null,
              [
                ['R-tree [4]', h(M, { t: 'O(n \\log n)' }), h(M, { t: 'O(\\log n + k)' }), 'Garantías sólo amortizadas; peor caso depende de la heurística de split.'],
                ['KD-tree', h(M, { t: 'O(n \\log n)' }), h(M, { t: 'O(\\sqrt{n} + k)' }), 'Diseñado para puntos; búsqueda por rangos subóptima sobre rectángulos.'],
                ['Segment Tree 2D', h(M, { t: 'O(n \\log^2 n)' }), h(M, { t: 'O(\\log^2 n + k)' }), h('span', null, 'Misma consulta, pero factor extra ', h('em', null, 'log n'), ' en memoria.')],
                ['Sweep line + BIT', h(M, { t: 'O(n \\log n)' }), '— (offline)', 'Excelente para batch; no soporta consultas ad-hoc posteriores.'],
                ['Interval Tree 2D ★', h(M, { t: 'O(n \\log n)' }), h(M, { t: 'O(\\log^2 n + k)' }), 'Peor caso garantizado y construcción estática sin rotaciones.'],
              ].map(([m, c, q, r], i) =>
                h('tr', { key: i, className: i === 4 ? 'tr-hi' : '' },
                  h('td', { style: { fontWeight: 500 } }, m),
                  h('td', { className: 'td-n' }, c),
                  h('td', { className: 'td-n' }, q),
                  h('td', null, r)
                )
              )
            )
          )
        )
      ),

      // V
      h(Sec, { id: 'V', n: '§ 05', title: 'Implementación y complejidad' },
        h('p', null,
          'La integración particiona el problema por grupos ',
          h(M, { t: '(h,r)' }),
          '. Cada combinación producto × variante tiene su propio árbol. La función ',
          h('code', { className: 'inline-code' }, 'evaluate(o_src, hits)'),
          ' compara descuentos y emite un estado (OK, divergencia, ausente).'
        ),
        h(CB, { lang: 'python', badge: 'pipeline completo' }, pipelineCode),

        h(H3, { n: '5.1' }, 'Complejidad comparada'),
        h('div', { className: 'ptable-wrap' },
          h('table', { className: 'ptable' },
            h('thead', null,
              h('tr', null,
                h('th', null, 'Métrica'),
                h('th', null, 'It. 1 — pandas'),
                h('th', null, 'It. 2 — Polars'),
                h('th', null, 'It. 3 — Interval Tree 2D')
              )
            ),
            h('tbody', null,
              [
                ['Complejidad espacial', h(M, { t: 'O(n \\cdot d_1 \\cdot d_2)' }), h(M, { t: 'O(n \\cdot d_1 \\cdot d_2)' }), h(M, { t: 'O(n \\log n)' })],
                ['Construcción del índice', '—', '—', h(M, { t: 'O(n \\log^2 n)' })],
                ['Consulta por oferta', h(M, { t: 'O(d_1 \\cdot d_2)' }), h(M, { t: 'O(d_1 \\cdot d_2)' }), h(M, { t: 'O(\\log^2 n + k)' })],
                ['Escalabilidad', 'Cuadrática', 'Cuadrática', 'Logarítmica'],
                ['RAM consumida', 'OOM (>16 GB)', '~9,8 GB', '~85 MB'],
                ['Tiempo total', 'No terminaba', '~18 min', '< 30 seg'],
              ].map(([m, i1, i2, i3], i) =>
                h('tr', { key: i },
                  h('td', { style: { fontWeight: 500 } }, m),
                  h('td', { className: 'td-n' }, i1),
                  h('td', { className: 'td-n' }, i2),
                  h('td', { className: 'td-g' }, i3)
                )
              )
            )
          )
        ),
        h('p', null,
          'La iteración 2 mejoró las constantes; la iteración 3 cambió el régimen. La eliminación del factor ',
          h(M, { t: 'd_1 \\cdot d_2' }), ' es el cambio cualitativo decisivo.'
        ),

        h(H3, { n: '5.2' }, 'Modelo de memoria'),
        h('p', null,
          'El consumo observado (~85 MB) se descompone así sobre una ejecución real de ', h(M, { t: 'n \\approx 6{,}5 \\cdot 10^5' }),
          ' ofertas distribuidas en ', h(M, { t: '\\approx 12\\,000' }),
          ' grupos ', h(M, { t: '(h,r)' }),
          '. La huella por nodo, medida con ', h('code', { className: 'inline-code' }, 'sys.getsizeof'),
          ' + slots, es de ~56 bytes (tres enteros de 28 bytes compartidos vía ', h('em', null, 'small-int cache'),
          ', tres referencias de 8 bytes y un byte de balance). El desglose, aproximado pero verificado:'
        ),
        h('div', { className: 'ptable-wrap' },
          h('table', { className: 'ptable' },
            h('thead', null,
              h('tr', null,
                h('th', null, 'Componente'),
                h('th', null, 'Fórmula'),
                h('th', null, 'Valor'),
                h('th', null, '% del total')
              )
            ),
            h('tbody', null,
              [
                ['Nodos árbol exterior (BW)', h(M, { t: 'n \\cdot 56\\text{ B}' }), '~ 35 MB', '41 %'],
                ['Nodos árboles interiores (TP)', h(M, { t: 'n \\log n \\cdot 56\\text{ B}' }), '~ 32 MB', '38 %'],
                ['Payloads (referencias a Offer)', h(M, { t: 'n \\cdot 8\\text{ B}' }), '~ 5 MB', '6 %'],
                ['DataFrames Polars (arena Arrow)', '—', '~ 11 MB', '13 %'],
                ['Overhead intérprete + GC', '—', '~ 2 MB', '2 %'],
                ['Total medido', '—', '~ 85 MB', '100 %'],
              ].map(([c, f_, v, p], i) =>
                h('tr', { key: i, className: i === 5 ? 'tr-hi' : '' },
                  h('td', { style: { fontWeight: 500 } }, c),
                  h('td', { className: 'td-n' }, f_),
                  h('td', { className: 'td-n' }, v),
                  h('td', { className: 'td-n' }, p)
                )
              )
            )
          )
        ),
        h('p', null,
          'Comparado con los ~9,8 GB de la iteración 2 —dominados por la materialización de ',
          h(M, { t: 'n \\cdot d_1 \\cdot d_2 \\approx 1{,}44 \\cdot 10^8' }),
          ' filas de ~68 bytes cada una—, la reducción es de dos órdenes de magnitud. El factor decisivo no es la eficiencia de Polars frente a pandas, sino la eliminación del producto cartesiano.'
        ),

        h(H3, { n: '5.3' }, 'Perfilado de la ejecución'),
        h('p', null,
          'Sobre la misma máquina (MacBook Pro M2, 16 GB), ',
          h('code', { className: 'inline-code' }, 'cProfile'),
          ' arroja la siguiente distribución para el total de 27,4 s:'
        ),
        h('div', { className: 'ptable-wrap' },
          h('table', { className: 'ptable' },
            h('thead', null,
              h('tr', null,
                h('th', null, 'Fase'),
                h('th', null, 'Tiempo'),
                h('th', null, 'Complejidad'),
                h('th', null, '% wall')
              )
            ),
            h('tbody', null,
              [
                ['Lectura calamine + Polars', '6,1 s', h(M, { t: 'O(n)' }), '22 %'],
                ['Normalización (melt, parse)', '3,9 s', h(M, { t: 'O(n)' }), '14 %'],
                ['Construcción árboles 2D', '5,4 s', h(M, { t: 'O(n \\log^2 n)' }), '20 %'],
                ['Consultas + evaluate', '10,8 s', h(M, { t: 'O(n \\log^2 n)' }), '39 %'],
                ['Serialización del reporte', '1,2 s', h(M, { t: 'O(n)' }), '5 %'],
              ].map(([ph, t, cx, pc], i) =>
                h('tr', { key: i },
                  h('td', { style: { fontWeight: 500 } }, ph),
                  h('td', { className: 'td-n' }, t),
                  h('td', { className: 'td-n' }, cx),
                  h('td', { className: 'td-n' }, pc)
                )
              )
            )
          )
        ),
        h('p', null,
          'La etapa dominante es la consulta + evaluación (39 %). El ', h('em', null, 'bottleneck'),
          ' residual ya no es asintótico sino la deserialización Python de cada oferta; migrar ',
          h('code', { className: 'inline-code' }, 'evaluate'), ' a Rust mediante ',
          h('code', { className: 'inline-code' }, 'PyO3'),
          ' es una optimización posible pero innecesaria al precio/rendimiento actual.'
        )
      ),

      // VI
      h(Sec, { id: 'VI', n: '§ 06', title: 'Resultados y conclusiones' },
        h('p', null, 'La reescritura iterativa transformó un sistema colapsado en un producto performante. Los resultados con mayor impacto operativo:'),

        h('div', { className: 'results-grid' },
          [
            { v: h(React.Fragment, null, '99', h('em', null, '%')), l: 'reducción\nde RAM' },
            { v: h(React.Fragment, null, '<', h('em', null, '30'), 's'), l: 'tiempo\ntotal' },
            { v: h(React.Fragment, null, '0', h('em', null, '%')), l: 'desviación\nresultados' },
            { v: h(React.Fragment, null, 'log', h('em', null, '²n')), l: 'complejidad\nconsulta' },
          ].map((c, i) =>
            h('div', { key: i, className: 'rcard' },
              h('div', { className: 'rcard-v' }, c.v),
              h('div', { className: 'rcard-l' }, c.l)
            )
          )
        ),

        h('ul', null,
          h('li', null, h('strong', null, 'Liberación de memoria: '), 'reducción del consumo de RAM superior al 99 %, devolviendo la viabilidad a hardware de equipo.'),
          h('li', null, h('strong', null, 'Escalabilidad independiente de la duración: '), 'el negocio puede ampliar campañas a meses sin penalizar la infraestructura.'),
          h('li', null, h('strong', null, 'Validación y exactitud: '), '0 % de desviación frente al modelo de discretización diaria.'),
          h('li', null, h('strong', null, 'Trazabilidad: '), 'las tres iteraciones quedan documentadas como evidencia de método: medir, optimizar lo que aporta, reformular cuando el régimen asintótico lo exige.')
        ),

        MemFig && h(Fig, {
          n: '08', label: 'Comparativa visual de memoria',
          caption: 'El árbol elimina la saturación de RAM; la solución corre localmente sin hardware especializado.'
        }, h(MemFig)),

        h(PQ, null, '"La ingeniería algorítmica permitió que la duración de las ofertas pasara de riesgo catastrófico a parámetro comercial completamente libre."')
      ),

      // Refs
      h(Sec, { id: 'Ref', n: '§ REF', title: 'Referencias' },
        h('ol', { className: 'refs' },
          [
            h('span', null, 'Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009). ', h('em', null, 'Introduction to Algorithms'), ', 3rd ed. MIT Press. §14.3, pp. 348–354.'),
            h('span', null, 'de Berg, M., Cheong, O., van Kreveld, M., & Overmars, M. (2008). ', h('em', null, 'Computational Geometry: Algorithms and Applications'), ', 3rd ed. Springer. Cap. 10.'),
            h('span', null, 'Edelsbrunner, H. (1983). A new approach to rectangle intersections. ', h('em', null, 'Int. Journal of Computer Mathematics, 13'), '(3–4), 209–229.'),
            h('span', null, 'Gaede, V., & Günther, O. (1998). Multidimensional access methods. ', h('em', null, 'ACM Computing Surveys, 30'), '(2), 170–231.'),
            h('span', null, 'Bentley, J. L. (1979). Decomposable searching problems. ', h('em', null, 'Information Processing Letters, 8'), '(5), 244–251.'),
            h('span', null, 'Vink, R. et al. (2024). ', h('em', null, 'Polars: Lightning-fast DataFrame library'), '. pola.rs.'),
          ].map((r, i) => h('li', { key: i, className: 'ref' }, h('span', null, r)))
        )
      )
    ),

    // Foot
    h('footer', { className: 'foot' },
      h('span', null, 'Nelson Ponce Luna'),
      h('span', null, '© 2026  ·  v 3.1')
    )
  );

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
