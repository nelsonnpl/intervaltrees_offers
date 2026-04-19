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
