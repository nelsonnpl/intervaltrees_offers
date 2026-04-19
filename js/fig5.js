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
