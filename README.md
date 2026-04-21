# Interval Trees 2D — Paper (sitio estático)

Autor: **Nelson Ponce Luna** — *Data Science & Automation Developer*  
Fecha: 17 abril 2026  

Este repositorio contiene un paper interactivo (HTML + React UMD) que documenta un caso real de **conciliación comercial** mediante **árboles de intervalos 2D** (BW × TP). El enfoque modela cada oferta como un **rectángulo** en \(\mathbb{R}^2\) y responde consultas de solape con coste sublineal.

## Motivación (resumen ejecutivo)

El problema original se intentó resolver “expandiendo día por día” (discretización de rangos). Esa decisión provoca un **producto cartesiano** (BW × TP) que explota el número de filas y termina colapsando la máquina (thrashing/swap y OOM), especialmente en entornos corporativos con límites de memoria.

La solución evolucionó en tres iteraciones:

1. **v1 — pandas**: discretización día-a-día + joins exactos → **inviable** por memoria.
2. **v3 — Polars + calamine**: mejora de throughput y RAM (motor en Rust + lectura xlsx eficiente), pero **misma complejidad asintótica**.
3. **v5 — Interval Trees 2D**: reformulación geométrica e indexación logarítmica → reducción drástica de RAM y tiempos.

## Modelo técnico

Una oferta se representa por:

\[
O = (h, r, [bw_l, bw_h], [tp_l, tp_h], \delta)
\]

donde \([bw_l, bw_h]\) es **Booking Window** y \([tp_l, tp_h]\) es **Travel Period**. La conciliación requiere encontrar, para cada oferta origen, todas las ofertas destino que **solapan** en ambas dimensiones.

### Solape 1D

Dos intervalos \([a_l, a_h]\) y \([b_l, b_h]\) solapan si:

\[
a_l \le b_h \;\wedge\; b_l \le a_h
\]

### Solape 2D

Dos rectángulos solapan si solapan en BW **y** en TP.

## Estructura de datos

Se usa un **árbol de intervalos aumentado** (BST balanceado tipo AVL) en la dimensión exterior (BW). Cada nodo mantiene:

- intervalo \([l, h]\)
- aumentación \(m\): **máximo h en el subárbol** (permite poda)

Para 2D, el payload puede ser:

- (a) la oferta (si se implementa un árbol 2D directo), o
- (b) un “árbol interior” por nodo con intervalos TP (estrategia de dos niveles / segmentación por candidatos).

Teóricamente, la consulta queda en el orden:

- **Tiempo**: \(O(\log^2 n + k)\) (dependiendo del esquema exacto), donde \(k\) es el número de matches
- **Espacio**: \(O(n\log n)\) o \(O(n)\) según implementación y materialización del nivel interior

## Ejecutar en local

Este proyecto es **estático**. Solo hace falta un server simple para evitar restricciones de CORS.

- Opción A (Python): `python3 serve.py`
- Abrir: `http://localhost:3000`

## Archivos importantes

- `index.html`: paper interactivo (contiene CSS + componentes React y figuras embebidas)
- `js/app.js`: lógica principal de la app (React UMD)
- `serve.py`: servidor local

## Nota

Este paper y su implementación son parte de un proyecto realizado por **Nelson Ponce Luna** (*Data Science & Automation Developer*).
