// ── Main App ──────────────────────────────────────────────────────────────────

const tocItems = [
  { id: 'I',   n: 'I.',   title: 'Introducción y Contexto Operativo' },
  { id: 'II',  n: 'II.',  title: 'Génesis del Proyecto: Detección y Tres Iteraciones' },
  { id: 'III', n: 'III.', title: 'Definición Técnica del Problema' },
  { id: 'IV',  n: 'IV.',  title: 'Arquitectura de la Solución' },
  { id: 'V',   n: 'V.',   title: 'Implementación y Complejidad' },
  { id: 'VI',  n: 'VI.',  title: 'Resultados y Conclusiones' },
  { id: 'Ref', n: 'Ref.', title: 'Referencias' },
];

// ── Code snippets ────────────────────────────────────────────────────────────

const insertCode = `<span class="code-type">class</span> <span class="code-fn">IntervalNode</span>:
    interval: <span class="code-fn">Interval</span>          <span class="code-comment"># [l, h] de este nodo</span>
    m:        int               <span class="code-comment"># max(h) en el subárbol — propiedad aumentada</span>
    left:     IntervalNode
    right:    IntervalNode

<span class="code-kw">def</span> <span class="code-fn">insert</span>(node, interval):
    <span class="code-kw">if</span> interval.l < node.interval.l:
        node.left  = <span class="code-fn">insert</span>(node.left, interval)
    <span class="code-kw">else</span>:
        node.right = <span class="code-fn">insert</span>(node.right, interval)
    node.m = <span class="code-fn">max</span>(node.m, interval.h)   <span class="code-comment"># actualizar m en ascenso</span>
    <span class="code-kw">return</span> node`;

const queryCode = `<span class="code-kw">def</span> <span class="code-fn">query_all</span>(node, q_l, q_h, results):
    <span class="code-kw">if</span> node <span class="code-kw">is</span> None:
        <span class="code-kw">return</span>
    <span class="code-comment"># Poda: ningún intervalo del subárbol puede solapar con la consulta</span>
    <span class="code-kw">if</span> node.m < q_l:
        <span class="code-kw">return</span>
    <span class="code-comment"># Verificar el intervalo del nodo actual</span>
    <span class="code-kw">if</span> node.interval.l <= q_h <span class="code-kw">and</span> node.interval.h >= q_l:
        results.<span class="code-fn">append</span>(node.interval)
    <span class="code-comment"># Descender a ambos hijos (la poda los filtrará si aplica)</span>
    <span class="code-fn">query_all</span>(node.left,  q_l, q_h, results)
    <span class="code-fn">query_all</span>(node.right, q_l, q_h, results)`;

const pipelineCode = `<span class="code-comment"># Fase 1 · Construir el índice desde el sistema destino</span>
trees = {}
<span class="code-kw">for</span> (group_key, offers) <span class="code-kw">in</span> dst_df.<span class="code-fn">group_by</span>([<span class="code-str">"hotel"</span>, <span class="code-str">"room"</span>]):
    trees[group_key] = <span class="code-fn">IntervalTree2D</span>()
    <span class="code-kw">for</span> o <span class="code-kw">in</span> offers:
        trees[group_key].<span class="code-fn">insert</span>(
            bw=(o.bw_l, o.bw_h),
            tp=(o.tp_l, o.tp_h),
            payload=o,
        )

<span class="code-comment"># Fase 2 · Consultar cada oferta del sistema origen</span>
results = []
<span class="code-kw">for</span> o_src <span class="code-kw">in</span> src_df.<span class="code-fn">iter_rows</span>():
    tree = trees.<span class="code-fn">get</span>((o_src.hotel, o_src.room))
    hits = tree.<span class="code-fn">query_2d</span>(
        o_src.bw_l, o_src.bw_h,
        o_src.tp_l, o_src.tp_h,
    ) <span class="code-kw">if</span> tree <span class="code-kw">else</span> []
    results.<span class="code-fn">append</span>(<span class="code-fn">evaluate</span>(o_src, hits))   <span class="code-comment"># compara descuento y emite estado</span>`;

const ingestCode = `<span class="code-comment"># Lectura heterogénea: el origen suele venir en .xlsx (formato ancho)</span>
<span class="code-comment"># y el destino en .csv (formato largo, separador ; ).</span>
src_raw = <span class="code-fn">read_excel</span>(<span class="code-str">"origen.xlsx"</span>, engine=<span class="code-str">"calamine"</span>)
dst_raw = <span class="code-fn">read_csv</span>(<span class="code-str">"destino.csv"</span>, sep=<span class="code-str">";"</span>, encoding=<span class="code-str">"utf-8-sig"</span>)

<span class="code-comment"># Normalización del esquema:</span>
<span class="code-comment">#   · pivot ancho → largo (una fila por fecha)</span>
<span class="code-comment">#   · parseo de fechas multi-formato (DD/MM/YYYY, YYYY-MM-DD, …)</span>
<span class="code-comment">#   · mapeo de códigos equivalentes entre sistemas</span>
src_df = <span class="code-fn">normalize</span>(src_raw, schema=COMMON_SCHEMA)
dst_df = <span class="code-fn">normalize</span>(dst_raw, schema=COMMON_SCHEMA)`;

const App = () => {
  // Scroll progress bar
  useEffect(() => {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    const onScroll = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      bar.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return React.createElement(
    'div', { className: 'paper-shell' },
    React.createElement('div', { className: 'paper-col' },

      // ── Title block ─────────────────────────────────────────────
      React.createElement('header', { style: { marginBottom: '3.5rem' } },
        React.createElement('h1', { className: 'paper-title' },
          'Caso de Estudio: Interval Trees 2D',
          React.createElement('br'),
          'para Conciliación de Ofertas Comerciales',
          React.createElement('span', { className: 'title-divider' })
        ),

        React.createElement('div', { className: 'paper-meta' },
          React.createElement('div', null,
            React.createElement('div', { className: 'paper-meta-dept' }, 'Nelson Ponce Luna'),
            React.createElement('div', { className: 'paper-meta-sub' }, 'Data Science & Automation Developer')
          ),
          React.createElement('div', { className: 'paper-meta-info' },
            React.createElement('div', null, 'Versión: 3.1'),
            React.createElement('div', null, 'Fecha de Publicación: 17/04/2026')
          )
        ),

        // Abstract
        React.createElement('div', { className: 'abstract' },
          React.createElement('div', { className: 'abstract-label' }, 'Resumen'),
          React.createElement('p', { className: 'abstract-body' },
            'Este documento describe el proceso —desde la detección de la necesidad operativa hasta la implementación final— de un motor de conciliación de ofertas definidas por dos rangos temporales: ventana de reserva (',
            React.createElement('em', null, 'Booking Window'),
            ') y período de viaje (',
            React.createElement('em', null, 'Travel Period'),
            '). El proyecto recorrió ',
            React.createElement('strong', null, 'tres iteraciones'),
            ': un primer prototipo en pandas que expandía las fechas día a día y colapsó la máquina por consumo de RAM; una segunda versión que migró el motor a Polars (núcleo Rust) y la lectura de hojas de cálculo a calamine, recortando el tiempo y la memoria sin alterar la complejidad asintótica; y una tercera reformulación geométrica que indexa cada oferta como un rectángulo en ',
            React.createElement(M, { t: '\\mathbb{R}^2' }),
            ' mediante un Árbol de Intervalos Aumentado bidimensional. Esta última iteración reduce la complejidad espacial a ',
            React.createElement(M, { t: 'O(n \\log n)' }),
            ' y el tiempo de consulta a ',
            React.createElement(M, { t: 'O(\\log^2 n + k)' }),
            ', con una reducción empírica del consumo de RAM superior al 99 % y equivalencia formal de resultados respecto al modelo naive.'
          )
        ),

        React.createElement('div', { className: 'keywords' },
          React.createElement('strong', null, 'Palabras clave  —  '),
          'Interval Tree · Augmented BST · 2D Range Query · Polars · Calamine · Complejidad Espacial · Pipelines de Datos · Conciliación de Ofertas'
        )
      ),

      // ── Table of Contents ───────────────────────────────────────
      React.createElement(TOC, { items: tocItems }),

      // ═══════════════ I. INTRODUCCIÓN ══════════════════════════════
      React.createElement(Sec, { id: 'I', n: 'I.', title: 'Introducción y Contexto Operativo' },
        React.createElement('p', null,
          'En el ecosistema de sistemas de gestión de reservas, la conciliación entre las ofertas definidas comercialmente y las finalmente publicadas es un proceso crítico. Una oferta se define típicamente por parámetros como su producto, variante, descuento, y dos ventanas temporales cruciales: la ',
          React.createElement('em', null, 'Booking Window'),
          ' (BW) o ventana de reserva, y el ',
          React.createElement('em', null, 'Travel Period'),
          ' (TP) o período de viaje.'
        ),
        React.createElement('p', null,
          'Es de vital importancia ',
          React.createElement('strong', null, 'cuidar que los datos estén bien publicados'),
          '. Un pequeño desfase en las fechas de una oferta mal implementada puede provocar que un producto se venda con el descuento equivocado, lo que hace mandatorio crear un ',
          React.createElement('strong', null, 'cross check constante'),
          ' entre el sistema de origen y el destino final. Sin una conciliación automatizada y exacta, estos errores pasan desapercibidos en producción y se materializan directamente en severas ',
          React.createElement('strong', null, 'pérdidas económicas'),
          ' para la compañía.'
        ),
        React.createElement('p', null,
          'Por lo tanto, el reto de la ingeniería de datos en este contexto no es la simple igualdad de atributos, sino la evaluación rigurosa y eficiente de los ',
          React.createElement('strong', null, 'solapamientos temporales bidimensionales'),
          ' a escala de catálogo completo, para blindar las operaciones comerciales del negocio.'
        )
      ),

      // ═══════════════ II. GÉNESIS DEL PROYECTO ═══════════════════
      React.createElement(Sec, { id: 'II', n: 'II.', title: 'Génesis del Proyecto: Detección y Tres Iteraciones' },

        React.createElement('h3', { className: 'sec-h3' }, '2.1  Detección de la necesidad'),
        React.createElement('p', null,
          'El proyecto no nació como un encargo formal sino como respuesta a una observación recurrente desde el equipo de datos: las discrepancias entre el catálogo de origen y el destino se detectaban ',
          React.createElement('em', null, 'a posteriori'),
          ', cuando el cliente final ya se había topado con un descuento incorrecto o una fecha mal publicada. La solución artesanal en uso —cotejos manuales por muestreo sobre hojas de cálculo— era lenta, parcial y propensa a error humano. ',
          React.createElement('strong', null, 'Hacía falta un sistema de crosscheck automatizado, exhaustivo y reproducible'),
          ' capaz de procesar el catálogo entero sin intervención manual. Lo asumí como iniciativa propia y lo construí en tres iteraciones sucesivas, cada una respondiendo al límite operativo de la anterior.'
        ),

        React.createElement('h3', { className: 'sec-h3' }, '2.2  Vista panorámica de las tres iteraciones'),
        React.createElement('p', null,
          'La figura siguiente sintetiza el recorrido completo. Cada iteración mejoró sobre la anterior, pero solo la tercera modificó el régimen asintótico del problema: las dos primeras siguieron pagando el coste cuadrático de discretizar las fechas día a día.'
        ),

        React.createElement(Fig, {
          n: 1,
          label: 'Génesis del proyecto: tres iteraciones del motor de crosscheck',
          caption: React.createElement('span', null,
            'Cada tarjeta representa una iteración con su pila tecnológica, métricas observadas y aprendizaje. ',
            React.createElement('strong', null, 'v1.0'), ' (pandas) reveló el problema; ',
            React.createElement('strong', null, 'v3.x'), ' (Polars/calamine) lo pospuso; ',
            React.createElement('strong', null, 'v5.x'), ' (Interval Tree) lo eliminó.'
          )
        },
          React.createElement(FigJourney)
        ),

        React.createElement('h3', { className: 'sec-h3' }, '2.3  Iteración 1 — Prototipo en pandas'),
        React.createElement('p', null,
          'El primer prototipo se construyó con el stack más accesible: pandas + openpyxl. Su lógica era directa: leer ambos catálogos, expandir cada oferta en una fila por día (',
          React.createElement('em', null, 'cartesian explode'),
          ') y resolver la conciliación con un join exacto sobre cuatro claves. Funcionaba en pequeño, pero al ejecutarlo sobre el catálogo real la máquina entraba en swap, después en thrashing, y finalmente el kernel mataba el proceso. La causa raíz era estructural: una sola oferta con ventanas de pocos días ya generaba decenas de filas; el catálogo entero rebasaba los cien millones antes de poder iniciar el join.'
        ),

        React.createElement(Fig, {
          n: 2,
          label: 'Discretización cartesiana: el origen del colapso',
          caption: React.createElement('span', null,
            'Una sola oferta con ventanas de 5×5 días produce 25 filas. Escalado al catálogo real (10 000 ofertas, ventanas medias de 120×120 días), el ',
            React.createElement('em', null, 'DataFrame'), ' intermedio supera los ',
            React.createElement('strong', null, '144 millones'), ' de registros — antes incluso de poder ejecutar el join.'
          )
        },
          React.createElement(Fig3)
        ),

        React.createElement('p', null,
          'El comportamiento del sistema bajo esta carga era reproducible: la RAM crecía linealmente con la expansión, el ',
          React.createElement('em', null, 'swap'),
          ' entraba en juego cuando se rebasaba el límite físico, el I/O se disparaba por el ',
          React.createElement('em', null, 'thrashing'),
          ' y, finalmente, el ',
          React.createElement('code', { className: 'inline-code' }, 'OOM-killer'),
          ' del kernel interrumpía el proceso. ',
          React.createElement('strong', null, 'Diagnóstico:'),
          ' el cuello de botella no era de motor sino algorítmico — la materialización del producto cartesiano hacía inviable la solución incluso en hardware generoso.'
        ),

        React.createElement(Fig, {
          n: 3,
          label: 'Saturación del sistema bajo el modelo naive · telemetría reconstruida',
          caption: React.createElement('span', null,
            'Reconstrucción visual de la primera iteración (pandas) sobre máquina de equipo de 16 GB. Los cuatro indicadores (RAM, CPU, SWAP, I/O) entran en zona crítica de forma escalonada hasta que el kernel intercepta el proceso. La iteración 2 (Polars/calamine) reducirá los valores absolutos pero conservará la misma curva — solo retrasa el muro, no lo evita.'
          )
        },
          React.createElement(FigOverload)
        ),

        React.createElement('h3', { className: 'sec-h3' }, '2.4  Iteración 2 — Migración a Polars y calamine'),
        React.createElement('p', null,
          'La hipótesis de trabajo fue que un motor más eficiente podía absorber el coste. Reescribí el pipeline en Polars [6] (núcleo Rust, ',
          React.createElement('em', null, 'lazy evaluation'),
          ', paralelización por defecto) y sustituí la lectura xlsx por calamine. El resultado fue espectacular en términos de constante: el throughput se multiplicó por tres y la RAM máxima cayó a la mitad, hasta unos 9,8 GB. Pero la complejidad asintótica seguía siendo la misma —',
          React.createElement(M, { t: 'O(n \\cdot d_1 \\cdot d_2)' }),
          '— y cualquier ampliación de la ventana comercial (algo que el negocio pedía con frecuencia) volvía a poner el sistema al borde del OOM. ',
          React.createElement('strong', null, 'Diagnóstico:'),
          ' optimizar el motor pospone el muro pero no lo elimina.'
        ),

        React.createElement('h3', { className: 'sec-h3' }, '2.5  Iteración 3 — Reformulación con Árboles de Intervalos'),
        React.createElement('p', null,
          'La tercera iteración fue un cambio de paradigma. En lugar de discretizar las fechas, observé que cada oferta era —geométricamente— un rectángulo en el plano BW × TP, y que la conciliación se reducía a un problema clásico de ',
          React.createElement('em', null, 'rectangle intersection'),
          '. Indexando los rectángulos en un Árbol de Intervalos Aumentado bidimensional, el coste espacial cayó a ',
          React.createElement(M, { t: 'O(n \\log n)' }),
          ' y el de consulta a ',
          React.createElement(M, { t: 'O(\\log^2 n + k)' }),
          ' —independiente de la duración de las ventanas. ',
          React.createElement('strong', null, 'Resultado:'),
          ' el procesamiento completo se ejecuta en menos de 30 segundos consumiendo 85 MB de RAM, sobre la misma máquina donde la v1.0 había muerto.'
        ),

        React.createElement('div', { className: 'pull-quote' },
          'El aprendizaje transversal es claro: medir antes de optimizar y reformular antes de escalar. Cambiar el motor da rendimiento; cambiar la estructura de datos da viabilidad.'
        ),

        React.createElement('p', { style: { fontSize: '0.78rem', color: '#8a8a82', fontStyle: 'italic', marginTop: '1rem' } },
          'A partir del próximo apartado, el documento adopta voz técnica formal para detallar el modelo y la arquitectura que materializan la tercera iteración.'
        )
      ),

      // ═══════════════ III. DEFINICIÓN TÉCNICA DEL PROBLEMA ═══════
      React.createElement(Sec, { id: 'III', n: 'III.', title: 'Definición Técnica del Problema' },
        React.createElement('p', null,
          'Sea una oferta una tupla ',
          React.createElement(M, { t: 'O = (h,\\, r,\\, [bw_l, bw_h],\\, [tp_l, tp_h],\\, \\delta)' }),
          ' donde ', React.createElement(M, { t: 'h' }), ' identifica el producto, ',
          React.createElement(M, { t: 'r' }), ' la variante, los pares ',
          React.createElement(M, { t: '[bw_l, bw_h]' }), ' y ', React.createElement(M, { t: '[tp_l, tp_h]' }),
          ' los intervalos cerrados de ventana de reserva y período de viaje, y ',
          React.createElement(M, { t: '\\delta \\in [0, 1]' }),
          ' el descuento aplicado. Geométricamente, cada oferta es un rectángulo alineado con los ejes en el plano ',
          React.createElement(M, { t: '\\mathbb{R}^2' }), '.'
        ),

        React.createElement(Fig, {
          n: 4,
          label: 'Representación geométrica de las fechas',
          caption: React.createElement('span', null,
            'Cada oferta es un rectángulo en el plano BW × TP. La conciliación se reduce a búsqueda de intersecciones rectangulares (regiones rojas). El origen es el rectángulo de borde sólido y el destino el punteado.'
          )
        },
          React.createElement(Fig1)
        ),

        React.createElement('p', null,
          'Dos ofertas ', React.createElement(M, { t: 'O_s' }), ' y ', React.createElement(M, { t: 'O_d' }),
          ' son ',
          React.createElement('em', null, 'compatibles'),
          ' si y solo si comparten producto y variante y sus rectángulos se solapan, es decir:'
        ),
        React.createElement('div', { className: 'eq-block' },
          React.createElement(M, { t: '(h_s, r_s) = (h_d, r_d) \\;\\wedge\\; bw_l^{(s)} \\le bw_h^{(d)} \\;\\wedge\\; bw_l^{(d)} \\le bw_h^{(s)} \\;\\wedge\\; tp_l^{(s)} \\le tp_h^{(d)} \\;\\wedge\\; tp_l^{(d)} \\le tp_h^{(s)}', d: true })
        ),
        React.createElement('p', null,
          'Este es un problema clásico de geometría computacional —',
          React.createElement('em', null, 'rectangle intersection'),
          '— estudiado desde los años ochenta por Edelsbrunner [3] y formalizado en de Berg et al. [2]. La conciliación a escala de catálogo se reduce, por tanto, a resolver eficientemente esta consulta para cada oferta del origen contra el conjunto del destino, ',
          React.createElement('strong', null, 'sin materializar el producto cartesiano de las fechas'),
          ' — el error que pagaron las dos primeras iteraciones del §II.'
        )
      ),

      // ═══════════════ IV. ARQUITECTURA DE LA SOLUCIÓN ════════════════════
      React.createElement(Sec, { id: 'IV', n: 'IV.', title: 'Arquitectura de la Solución' },
        React.createElement('p', null,
          'La arquitectura definitiva se organiza en dos fases: una primera de tratamiento de datos (heredada y consolidada de la iteración 2) y una segunda de indexación geométrica (la novedad de la iteración 3).'
        ),

        React.createElement('h3', { className: 'sec-h3' }, '4.1  Fase A — Tratamiento de datos (Polars y calamine)'),
        React.createElement('p', null,
          'Las fuentes llegan en formatos pesados (hojas de cálculo .xlsx y archivos .csv). Para evitar la saturación de I/O desde la carga, se implementó el uso de ',
          React.createElement('strong', null, 'Polars [6] + calamine'),
          ', combinación que garantiza una lectura vectorizada y eficiente en memoria. Las operaciones clave del módulo de ingestión son:'
        ),
        React.createElement('ul', { style: { listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: 2.05, margin: '0.5rem 0 1rem' } },
          React.createElement('li', null,
            React.createElement('strong', null, 'Pivot ancho → largo: '),
            'el origen llega típicamente con una columna por fecha; un ',
            React.createElement('em', null, 'melt'),
            ' lo transforma en una fila por oferta-fecha, lista para indexar.'
          ),
          React.createElement('li', null,
            React.createElement('strong', null, 'Parseo universal de fechas: '),
            'unificación de formatos heterogéneos (',
            React.createElement(M, { t: '\\text{DD/MM/YYYY}' }), ', ',
            React.createElement(M, { t: '\\text{YYYY-MM-DD}' }),
            ', etc.) y traducción a entero ordinal ',
            React.createElement(M, { t: '\\text{ord}(d) = (d - d_0).\\text{days}' }),
            '. Esta conversión es condición necesaria para que los comparadores del árbol operen con aritmética entera.'
          ),
          React.createElement('li', null,
            React.createElement('strong', null, 'Mapeo y limpieza: '),
            'unificación de códigos equivalentes entre sistemas y exclusión anticipada de registros irrelevantes para reducir el volumen aguas abajo.'
          ),
        ),

        React.createElement(CodeBlock, { lang: 'python · ingestión' }, ingestCode),

        React.createElement(Fig, {
          n: 5,
          label: 'Pipeline completo: archivos heterogéneos → índice → reporte',
          caption: React.createElement('span', null,
            'Las cinco etapas del pipeline: lectura, normalización, indexación en el árbol 2D, cotejo y exportación del reporte unificado.'
          )
        },
          React.createElement(Fig2)
        ),

        React.createElement('h3', { className: 'sec-h3' }, '4.2  Fase B — Árboles de Intervalos Aumentados'),
        React.createElement('p', null,
          'En lugar de expandir los días, se indexan los intervalos como rangos continuos mediante ',
          React.createElement('strong', null, 'Árboles de Intervalos Aumentados'),
          ' [1, 2]. Cada nodo almacena un intervalo ', React.createElement(M, { t: '[l, h]' }),
          ' y se aumenta con un valor adicional ', React.createElement(M, { t: 'm(v)' }), ':'
        ),
        React.createElement('div', { className: 'eq-block' },
          React.createElement(M, { t: 'm(v) \\;=\\; \\max\\!\\bigl(\\,v.h,\\;\\; m(v.\\text{left}),\\;\\; m(v.\\text{right})\\,\\bigr)', d: true })
        ),
        React.createElement('p', null,
          'Esta propiedad permite ',
          React.createElement('strong', null, 'podar subárboles enteros'),
          ' durante la consulta: si para un nodo ', React.createElement(M, { t: 'v' }),
          ' se cumple ', React.createElement(M, { t: 'm(v) < q_l' }),
          ', es matemáticamente imposible que algún intervalo del subárbol solape con la consulta ',
          React.createElement(M, { t: '[q_l, q_h]' }), ', y se descarta de un plumazo.'
        ),

        React.createElement(CodeBlock, { lang: 'python · consulta' }, queryCode),

        React.createElement(Fig, {
          n: 6,
          label: 'Árbol de Intervalos: animación de consulta con poda',
          caption: React.createElement('span', null,
            'La consulta visita los nodos candidatos (azul), confirma ',
            React.createElement('em', null, 'hits'), ' (verde) y descarta ramas enteras (rojo) gracias a la propiedad ',
            React.createElement(M, { t: 'm(v) < q_l' }), '.'
          )
        },
          React.createElement(Fig4)
        ),

        React.createElement('p', null,
          'Dado que el problema requiere cotejar tanto la ventana de reserva como el período de viaje, se extiende la estructura a un ',
          React.createElement('strong', null, 'árbol de intervalos anidado'),
          ' (2D Interval Tree) [2]: un árbol exterior indexa la dimensión BW y cada nodo contiene un sub-árbol que indexa la dimensión TP. La consulta procede en dos fases: el árbol BW devuelve nodos candidatos en ',
          React.createElement(M, { t: 'O(\\log n)' }),
          ' y para cada uno se lanza una sub-consulta TP, totalizando ',
          React.createElement(M, { t: 'O(\\log^2 n + k)' }), '.'
        ),

        React.createElement(Fig, {
          n: 7,
          label: 'Consulta bidimensional en árbol anidado',
          caption: React.createElement('span', null,
            'El árbol exterior (azul) localiza los candidatos en BW. Para cada uno, el sub-árbol interior (verde) confirma TP.'
          )
        },
          React.createElement(Fig5)
        )
      ),

      // ═══════════════ V. IMPLEMENTACIÓN Y COMPLEJIDAD ════════════════════
      React.createElement(Sec, { id: 'V', n: 'V.', title: 'Implementación y Complejidad' },
        React.createElement('p', null,
          'La integración en el pipeline particiona el problema por grupos lógicos ',
          React.createElement(M, { t: '(h, r)' }),
          ' —cada combinación producto × variante tiene su propio árbol—. Esto distribuye la carga de memoria, permite paralelizar la construcción y acota el tamaño de cada índice; la complejidad total ',
          React.createElement(M, { t: 'O(n \\log n)' }),
          ' se mantiene al insertar cada oferta exactamente una vez. La función ',
          React.createElement('code', { className: 'inline-code' }, 'evaluate(o_src, hits)'),
          ' compara el descuento ', React.createElement(M, { t: '\\delta' }),
          ' del origen con cada coincidencia y emite un estado (OK, divergencia, ausente).'
        ),
        React.createElement(CodeBlock, { lang: 'python · pipeline' }, pipelineCode),

        React.createElement('h3', { className: 'sec-h3' }, '5.1  Métricas de complejidad comparada'),
        React.createElement('p', null,
          'La tabla canónica resume las tres iteraciones contra el modelo geométrico final:'
        ),

        React.createElement('table', { className: 'paper-table' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', null, 'Métrica'),
              React.createElement('th', null, 'It. 1 — pandas'),
              React.createElement('th', null, 'It. 2 — Polars'),
              React.createElement('th', null, 'It. 3 — Interval Tree 2D')
            )
          ),
          React.createElement('tbody', null,
            [
              ['Complejidad espacial',     React.createElement(M, { t: 'O(n \\cdot d_1 \\cdot d_2)' }), React.createElement(M, { t: 'O(n \\cdot d_1 \\cdot d_2)' }), React.createElement(M, { t: 'O(n \\log n)' })],
              ['Construcción del índice',  '—',                                                          '—',                                                         React.createElement(M, { t: 'O(n \\log^2 n)' })],
              ['Consulta por oferta',      React.createElement(M, { t: 'O(d_1 \\cdot d_2)' }),          React.createElement(M, { t: 'O(d_1 \\cdot d_2)' }),         React.createElement(M, { t: 'O(\\log^2 n + k)' })],
              ['Escalabilidad temporal',   'Cuadrática',                                                 'Cuadrática',                                                'Logarítmica'],
              ['RAM consumida',            'OOM (>16 GB)',                                               '~9,8 GB',                                                    '~85 MB'],
              ['Tiempo total',             'No terminaba',                                               '~18 min',                                                    '< 30 seg'],
            ].map(([metric, it1, it2, it3], i) =>
              React.createElement('tr', { key: i },
                React.createElement('td', { style: { fontWeight: '600' } }, metric),
                React.createElement('td', { className: 'td-naive' }, it1),
                React.createElement('td', { className: 'td-naive' }, it2),
                React.createElement('td', { className: 'td-tree' }, it3)
              )
            )
          )
        ),
        React.createElement('p', null,
          'La iteración 2 mejoró las constantes; la iteración 3 cambió el régimen. La eliminación del factor ',
          React.createElement(M, { t: 'd_1 \\cdot d_2' }),
          ' es el cambio cualitativo decisivo —y la base de los resultados de la sección siguiente.'
        )
      ),

      // ═══════════════ VI. RESULTADOS Y CONCLUSIONES ══════════════════════
      React.createElement(Sec, { id: 'VI', n: 'VI.', title: 'Resultados y Conclusiones' },
        React.createElement('p', null,
          'La reescritura iterativa del motor de conciliación —desde la detección de la necesidad hasta la reformulación geométrica final— transformó un sistema colapsado en un producto altamente performante. Los resultados con mayor impacto operativo son:'
        ),
        React.createElement('ul', { style: { listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: 2.1, marginBottom: '1rem' } },
          React.createElement('li', null,
            React.createElement('strong', null, 'Liberación de memoria: '),
            'reducción empírica del consumo de RAM superior al 99 %, lo que devuelve la viabilidad a hardware de equipo y elimina la dependencia de máquinas dedicadas.'
          ),
          React.createElement('li', null,
            React.createElement('strong', null, 'Escalabilidad independiente de la duración: '),
            'el coste deja de depender de la duración de las ventanas; el negocio puede ampliar campañas a meses sin penalizar la infraestructura.'
          ),
          React.createElement('li', null,
            React.createElement('strong', null, 'Validación y exactitud: '),
            'pese al cambio de modelo, el motor mantiene 0 % de desviación frente al resultado del modelo de discretización diaria —corrección y completitud preservadas por la propiedad de aumento del árbol.'
          ),
          React.createElement('li', null,
            React.createElement('strong', null, 'Trazabilidad del proceso: '),
            'las tres iteraciones quedan documentadas como evidencia de un método de trabajo: medir, optimizar lo que aporta y reformular cuando el régimen asintótico lo exige.'
          ),
        ),

        React.createElement(Fig, {
          n: 8,
          label: 'Comparativa visual del consumo de memoria',
          caption: React.createElement('span', null,
            'El Árbol de Intervalos elimina la saturación de RAM, haciendo posible correr la solución localmente sin recurrir a hardware especializado.'
          )
        },
          React.createElement(Fig7)
        ),

        React.createElement('div', { className: 'pull-quote' },
          'Conclusión operativa: la ingeniería algorítmica aplicada permitió que la duración de las ofertas pasara de ser un riesgo catastrófico a un parámetro comercial completamente libre.'
        )
      ),

      // ═══════════════ REFERENCIAS ════════════════════════════════
      React.createElement(Sec, { id: 'Ref', n: 'Ref.', title: 'Referencias' },
        React.createElement('ol', { className: 'ref-list' },
          [
            React.createElement('span', null, 'Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009). ',
              React.createElement('em', null, 'Introduction to Algorithms'),
              ', 3rd ed. MIT Press. §14.3: Interval Trees, pp. 348–354.'),
            React.createElement('span', null, 'de Berg, M., Cheong, O., van Kreveld, M., & Overmars, M. (2008). ',
              React.createElement('em', null, 'Computational Geometry: Algorithms and Applications'),
              ', 3rd ed. Springer. Cap. 10.'),
            React.createElement('span', null, 'Edelsbrunner, H. (1983). A new approach to rectangle intersections. ',
              React.createElement('em', null, 'International Journal of Computer Mathematics, 13'),
              '(3–4), 209–229.'),
            React.createElement('span', null, 'Gaede, V., & Günther, O. (1998). Multidimensional access methods. ',
              React.createElement('em', null, 'ACM Computing Surveys, 30'),
              '(2), 170–231.'),
            React.createElement('span', null, 'Bentley, J. L. (1979). Decomposable searching problems. ',
              React.createElement('em', null, 'Information Processing Letters, 8'),
              '(5), 244–251.'),
            React.createElement('span', null, 'Vink, R. et al. (2024). ',
              React.createElement('em', null, 'Polars: Lightning-fast DataFrame library for Rust and Python'),
              '. pola.rs.'),
          ].map((ref, i) =>
            React.createElement('li', { key: i, className: 'ref-item' },
              React.createElement('span', { className: 'ref-num' }, `[${i + 1}]`),
              React.createElement('span', { className: 'ref-body' }, ref)
            )
          )
        )
      ),

      // ── Footer ─────────────────────────────────────────────────
      React.createElement('footer', { className: 'paper-footer' },
        React.createElement('span', null, 'Documento Técnico Interno · Proyecto Nelson Ponce Luna'),
        React.createElement('span', { className: 'footer-hash' }, '© 2026  ·  v 3.1')
      )
    )
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App)
);
