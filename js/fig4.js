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
