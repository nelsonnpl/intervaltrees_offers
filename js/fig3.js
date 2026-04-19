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
