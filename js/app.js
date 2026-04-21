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
