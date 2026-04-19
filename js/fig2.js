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
