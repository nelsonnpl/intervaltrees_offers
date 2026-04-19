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
    const y  = cardY + cardH / 2;
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
