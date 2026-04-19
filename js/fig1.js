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
