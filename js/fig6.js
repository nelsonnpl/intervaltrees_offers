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
