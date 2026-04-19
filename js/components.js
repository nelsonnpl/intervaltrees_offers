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
