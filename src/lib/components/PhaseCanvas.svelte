<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import { Runtime } from 'effect';
  import { computeTrajectory, computePointEnergy } from './physics';
  import type { Mode, Point, SimParams } from './physics';
  import PhaseTooltip from './PhaseTooltip.svelte';

  type Props = {
    m:            number;
    k:            number;
    gamma:        number;
    x0:           number;
    p0:           number;
    mode:         Mode;
    animating:    boolean;
    onLiveUpdate: (x: string, p: string, E: string, w: string) => void;
    onAnimEnd:    () => void;
  };

  const { m, k, gamma, x0, p0, mode, animating, onLiveUpdate, onAnimEnd }: Props = $props();

  // ─── DOM Refs ────────────────────────────────────────────────────────────────

  let containerEl: HTMLDivElement;
  let svgEl:       SVGSVGElement;
  let svgSel:      d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let particleGrp: d3.Selection<SVGGElement,   unknown, null, undefined>;

  // ─── Zoom-State ──────────────────────────────────────────────────────────────

  let gXAxis:      d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  let gYAxis:      d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  let gYAxisRight: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  let gXGrid:      d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  let gYGrid:      d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  let gPaths:      d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  let gNullX:      d3.Selection<SVGLineElement, unknown, null, undefined> | null = null;
  let gNullY:      d3.Selection<SVGLineElement, unknown, null, undefined> | null = null;

  // Linke Skala: Lagrange (vRange) oder Hamilton (pRange) je nach Modus
  // Rechte Skala: nur im "both"-Modus (Hamilton / pRange)
  let baseXScale:         d3.ScaleLinear<number, number> | null = null;
  let baseYScale:         d3.ScaleLinear<number, number> | null = null;
  let baseYScaleHamilton: d3.ScaleLinear<number, number> | null = null;

  let lastPoints: (Point | null)[] = [];
  let lastIW = 0, lastIH = 0;
  let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
  let currentTransform: d3.ZoomTransform = d3.zoomIdentity;
  let isZooming = false;

  // ─── Animation ───────────────────────────────────────────────────────────────

  const TRAIL_LENGTH = 40;
  const PATH_REDRAW_INTERVAL = 10;
  let trail: { x: number; p: number }[] = [];
  let animX = 0;
  let animP = 0;
  let animFrameId: number | null = null;
  let isAnimating = false;
  // Verhindert dass der $effect die Animation stoppt wenn nur die Feder endet
  let keepRunning = false;
  let stepsSinceLastDraw = 0;
  let animStepCount = 0;

  // ─── Tooltip ─────────────────────────────────────────────────────────────────

  let tooltipVisible = $state(false);
  let tooltipLeft    = $state(0);
  let tooltipTop     = $state(0);
  let tipX = $state(''), tipP = $state(''), tipT = $state(''), tipV = $state('');

  // ─── Derived ─────────────────────────────────────────────────────────────────

  // Im "both"-Modus: linke Achse = ẋ (Lagrange/orange), rechte = p (Hamilton/blau)
  const axisLabelLeft = $derived(
    mode === 'hamilton' ? 'p [kg·m/s]' : 'ẋ [m/s]'
  );

  const plotTitle = $derived(
    mode === 'lagrange'
      ? 'Phasenraum  ·  Position × Geschwindigkeit'
      : mode === 'hamilton'
      ? 'Phasenraum  ·  Kanonische Koordinaten (q, p)'
      : 'Phasenraum  ·  Lagrange (ẋ) & Hamilton (p)'
  );

  // Rechter Rand größer im "both"-Modus (Platz für rechte Achse + Label)
  const MARGIN = $derived(
    mode === 'both'
      ? { top: 28, right: 68, bottom: 52, left: 62 }
      : { top: 28, right: 28, bottom: 52, left: 62 }
  );

  // ─── Konstanten ──────────────────────────────────────────────────────────────

  const rt             = Runtime.defaultRuntime;
  const COLOR_LAGRANGE = '#fb923c';
  const COLOR_HAMILTON = '#38bdf8';
  const COLOR_AXIS     = '#cbd5e1';

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const styleAxis = (s: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    s.select('.domain').attr('stroke', 'rgba(255,255,255,0.12)');
    s.selectAll<SVGLineElement, unknown>('line').attr('stroke', 'rgba(255,255,255,0.12)');
    s.selectAll<SVGTextElement, unknown>('text')
      .attr('fill', COLOR_AXIS)
      .attr('font-family', '"DM Mono", monospace')
      .attr('font-size', '10px');
  };

  const styleAxisColored = (
    s: d3.Selection<SVGGElement, unknown, null, undefined>,
    color: string
  ) => {
    s.select('.domain').attr('stroke', `${color}55`);
    s.selectAll<SVGLineElement, unknown>('line').attr('stroke', `${color}33`);
    s.selectAll<SVGTextElement, unknown>('text')
      .attr('fill', color)
      .attr('font-family', '"DM Mono", monospace')
      .attr('font-size', '10px');
  };

  const styleGrid = (s: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    s.select('.domain').remove();
    s.selectAll('line').attr('stroke', 'rgba(255,255,255,0.04)');
    s.selectAll('text').remove();
  };

  // ─── Orbits zeichnen ─────────────────────────────────────────────────────────
  //
  //  ySc  = linke Skala  (Lagrange ẋ = p/m  — oder Hamilton p im single-mode)
  //  yScH = rechte Skala (Hamilton p)        — nur im "both"-Modus

  function drawOrbits(
    xSc:  d3.ScaleLinear<number, number>,
    ySc:  d3.ScaleLinear<number, number>,
    points: ReadonlyArray<Point | null>,
    yScH: d3.ScaleLinear<number, number> | null = null
  ) {
    if (!gPaths) return;
    gPaths.selectAll('*').remove();
    if (points.filter(p => p !== null).length < 2) return;

    const mkLine = (yFn: (pt: Point) => number) =>
      d3.line<Point | null>()
        .defined(d => d !== null)
        .x(d => xSc(d!.x))
        .y(d => yFn(d!))
        .curve(d3.curveCatmullRom.alpha(0.5));

    const drawCurve = (
      gradId: string, glowId: string, color: string,
      arrows: boolean, yFn: (pt: Point) => number
    ) => {
      gPaths!.append('path').datum(points)
        .attr('fill', 'none')
        .attr('stroke', `url(#${gradId})`)
        .attr('stroke-width', gamma > 0 ? 1.6 : 2.2)
        .attr('filter', `url(#${glowId})`)
        .attr('d', mkLine(yFn));

      if (arrows) {
        const nonNull = points.filter((p): p is Point => p !== null);
        const step = Math.floor(nonNull.length / 6);
        for (let i = step; i < nonNull.length - step * 2; i += step) {
          const a = nonNull[i];
          const b = nonNull[Math.min(i + 3, nonNull.length - 1)];
          const angle = Math.atan2(yFn(b) - yFn(a), xSc(b.x) - xSc(a.x)) * (180 / Math.PI);
          gPaths!.append('polygon').attr('points', '7,0 -4.5,4 -4.5,-4')
            .attr('fill', color).attr('fill-opacity', 0.8)
            .attr('transform', `translate(${xSc(a.x)},${yFn(a)}) rotate(${angle})`);
        }
      }
    };

    if (mode === 'lagrange') {
      drawCurve('grad-lagrange', 'glow-lagrange', COLOR_LAGRANGE, false,
        pt => ySc(pt.p / m));
    }
    if (mode === 'hamilton') {
      drawCurve('grad-hamilton', 'glow-hamilton', COLOR_HAMILTON, true,
        pt => ySc(pt.p));
    }
    if (mode === 'both') {
      // Lagrange-Kurve: linke Achse, y = ẋ = p/m
      drawCurve('grad-lagrange', 'glow-lagrange', COLOR_LAGRANGE, false,
        pt => ySc(pt.p / m));
      // Hamilton-Kurve: rechte Achse, y = p
      if (yScH) {
        drawCurve('grad-hamilton', 'glow-hamilton', COLOR_HAMILTON, true,
          pt => yScH(pt.p));
      }
    }
  }

  // ─── Draw ────────────────────────────────────────────────────────────────────

  async function draw() {
    if (!containerEl || !svgEl || !svgSel) return;

    const params: SimParams = { m, k, gamma, x0, p0 };
    const result = await Runtime.runPromise(rt)(computeTrajectory(params));
    const { points, energy, xRange, pRange, vRange } = result;

    lastPoints = [...points];
    // currentTransform bewusst NICHT zurückgesetzt — Zoom bleibt erhalten
    baseYScaleHamilton = null;
    gYAxisRight = null;

    const mg = MARGIN;
    const W  = containerEl.clientWidth;
    const H  = containerEl.clientHeight;
    const iW = W - mg.left - mg.right;
    const iH = H - mg.top  - mg.bottom;
    lastIW = iW; lastIH = iH;

    baseXScale = d3.scaleLinear().domain(xRange).range([0, iW]);

    // Linke y-Achse: ẋ (Lagrange/both) oder p (Hamilton)
    const yRangeLeft = mode === 'hamilton' ? pRange : vRange;
    baseYScale = d3.scaleLinear().domain(yRangeLeft).range([iH, 0]);

    // Rechte y-Achse: nur im "both"-Modus
    if (mode === 'both') {
      baseYScaleHamilton = d3.scaleLinear().domain(pRange).range([iH, 0]);
    }

    svgSel.selectAll('*').remove();
    svgSel.attr('width', W).attr('height', H);

    const defs = svgSel.append('defs');
    defs.append('clipPath').attr('id', 'plot-clip')
      .append('rect').attr('width', iW).attr('height', iH);

    const mkGradient = (id: string, color: string) => {
      const g = defs.append('linearGradient')
        .attr('id', id).attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', 0).attr('x2', W).attr('y2', H);
      g.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.95);
      g.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.55);
    };
    mkGradient('grad-lagrange', COLOR_LAGRANGE);
    mkGradient('grad-hamilton', COLOR_HAMILTON);

    const mkGlow = (id: string, stdDev: number) => {
      const f = defs.append('filter').attr('id', id)
        .attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
      f.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', stdDev).attr('result', 'blur');
      const merge = f.append('feMerge');
      merge.append('feMergeNode').attr('in', 'blur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');
    };
    mkGlow('glow-lagrange', gamma > 0 ? 2 : 5);
    mkGlow('glow-hamilton', gamma > 0 ? 2 : 5);
    mkGlow('glow-particle', 9);

    const g = svgSel.append('g').attr('transform', `translate(${mg.left},${mg.top})`);

    // Grid
    gXGrid = g.append('g').attr('class', 'grid-x').attr('transform', `translate(0,${iH})`);
    gYGrid = g.append('g').attr('class', 'grid-y');
    gXGrid.call(d3.axisBottom(baseXScale).ticks(8).tickSize(-iH).tickFormat(() => '')).call(styleGrid);
    gYGrid.call(d3.axisLeft(baseYScale).ticks(6).tickSize(-iW).tickFormat(() => '')).call(styleGrid);

    // Nulllinien
    gNullX = g.append('line')
      .attr('x1', baseXScale(0)).attr('x2', baseXScale(0)).attr('y1', 0).attr('y2', iH)
      .attr('stroke', 'rgba(255,255,255,0.1)').attr('stroke-width', 1);
    gNullY = g.append('line')
      .attr('x1', 0).attr('x2', iW).attr('y1', baseYScale(0)).attr('y2', baseYScale(0))
      .attr('stroke', 'rgba(255,255,255,0.1)').attr('stroke-width', 1);

    // Orbits
    gPaths = g.append('g').attr('class', 'paths').attr('clip-path', 'url(#plot-clip)');
    drawOrbits(baseXScale, baseYScale, lastPoints, baseYScaleHamilton);

    particleGrp = g.append('g').attr('class', 'particle-group').attr('clip-path', 'url(#plot-clip)');

    // Achsen
    gXAxis = g.append('g').attr('class', 'axis-x').attr('transform', `translate(0,${iH})`);
    gYAxis = g.append('g').attr('class', 'axis-y');
    gXAxis.call(d3.axisBottom(baseXScale).ticks(8)).call(styleAxis);

    if (mode === 'both') {
      gYAxis.call(d3.axisLeft(baseYScale).ticks(6))
        .call(s => styleAxisColored(s, COLOR_LAGRANGE));
    } else {
      gYAxis.call(d3.axisLeft(baseYScale).ticks(6)).call(styleAxis);
    }

    // Rechte Achse (Hamilton) nur im "both"-Modus
    if (mode === 'both' && baseYScaleHamilton) {
      gYAxisRight = g.append('g').attr('class', 'axis-y-right')
        .attr('transform', `translate(${iW},0)`);
      gYAxisRight.call(d3.axisRight(baseYScaleHamilton).ticks(6))
        .call(s => styleAxisColored(s, COLOR_HAMILTON));
    }

    // x-Achsenbeschriftung
    g.append('text').attr('x', iW / 2).attr('y', iH + 42).attr('text-anchor', 'middle')
      .attr('fill', COLOR_AXIS).attr('font-family', '"DM Mono", monospace').attr('font-size', '11px')
      .text('x [m]');

    // Linkes y-Label
    g.append('text').attr('transform', 'rotate(-90)').attr('x', -iH / 2).attr('y', -48)
      .attr('text-anchor', 'middle')
      .attr('fill', mode === 'both' ? COLOR_LAGRANGE : COLOR_AXIS)
      .attr('font-family', '"DM Mono", monospace').attr('font-size', '11px')
      .text(axisLabelLeft);

    // Rechtes y-Label (nur "both"-Modus)
    if (mode === 'both') {
      g.append('text')
        .attr('transform', 'rotate(90)')
        .attr('x', iH / 2)
        .attr('y', -(iW + 50))
        .attr('text-anchor', 'middle')
        .attr('fill', COLOR_HAMILTON)
        .attr('font-family', '"DM Mono", monospace').attr('font-size', '11px')
        .text('p [kg·m/s]');
    }

    if (gamma === 0) {
      g.append('text').attr('x', iW - 4).attr('y', 14).attr('text-anchor', 'end')
        .attr('fill', COLOR_AXIS).attr('font-family', '"DM Mono", monospace').attr('font-size', '10px')
        .text(`E = ${energy.toFixed(2)} J`);
    }

    // Zoom
    zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        if (!baseXScale || !baseYScale || !gXAxis || !gYAxis || !gXGrid || !gYGrid) return;
        currentTransform = event.transform;
        isZooming = true;
        tooltipVisible = false;
        particleGrp?.selectAll('.hover-dot').remove();
        const t   = event.transform;
        const nX  = t.rescaleX(baseXScale);
        const nY  = t.rescaleY(baseYScale);
        const nYH = baseYScaleHamilton ? t.rescaleY(baseYScaleHamilton) : null;

        gXAxis.call(d3.axisBottom(nX).ticks(8)).call(styleAxis);
        gXGrid.call(d3.axisBottom(nX).ticks(8).tickSize(-lastIH).tickFormat(() => '')).call(styleGrid);
        gYGrid.call(d3.axisLeft(nY).ticks(6).tickSize(-lastIW).tickFormat(() => '')).call(styleGrid);
        gNullX?.attr('x1', nX(0)).attr('x2', nX(0));
        gNullY?.attr('y1', nY(0)).attr('y2', nY(0));

        if (mode === 'both') {
          gYAxis.call(d3.axisLeft(nY).ticks(6)).call(s => styleAxisColored(s, COLOR_LAGRANGE));
          if (gYAxisRight && nYH) {
            gYAxisRight.call(d3.axisRight(nYH).ticks(6)).call(s => styleAxisColored(s, COLOR_HAMILTON));
          }
        } else {
          gYAxis.call(d3.axisLeft(nY).ticks(6)).call(styleAxis);
        }

        drawOrbits(nX, nY, lastPoints, nYH);
      })
      .on('end', () => { isZooming = false; });

    svgSel.call(zoomBehavior);
    // Gespeicherten Zoom wiederherstellen (kein Reset bei Parameter-Änderung)
    if (currentTransform !== d3.zoomIdentity) {
      svgSel.call(zoomBehavior.transform, currentTransform);
    }
    svgSel.on('dblclick.zoom', () => {
      svgSel.transition().duration(350).call(zoomBehavior!.transform, d3.zoomIdentity);
    });

    // Mouse-Interaktion
    g.append('rect').attr('width', iW).attr('height', iH)
      .attr('fill', 'transparent').style('cursor', 'crosshair')
      .on('mousemove', async (event: MouseEvent) => {
        if (isZooming) return;
        const curX  = currentTransform.rescaleX(baseXScale!);
        const curY  = currentTransform.rescaleY(baseYScale!);
        const curYH = baseYScaleHamilton ? currentTransform.rescaleY(baseYScaleHamilton) : null;
        const [mx, my] = d3.pointer(event);

        // Nächsten Punkt finden — im "both"-Modus minimale Distanz über beide Kurven
        let minDist = Infinity, nearest: Point | null = null;
        for (const pt of lastPoints) {
          if (pt === null) continue;
          const dL = Math.hypot(curX(pt.x) - mx, curY(pt.p / m) - my);
          const dH = curYH ? Math.hypot(curX(pt.x) - mx, curYH(pt.p) - my) : Infinity;
          const d  = mode === 'both' ? Math.min(dL, dH) : (mode === 'lagrange' ? dL : Math.hypot(curX(pt.x) - mx, curY(pt.p) - my));
          if (d < minDist) { minDist = d; nearest = pt; }
        }

        if (nearest && minDist < 28) {
          const e = await Runtime.runPromise(rt)(computePointEnergy(nearest, { m, k, gamma, x0, p0 }));
          tipX = nearest.x.toFixed(3) + ' m';
          tipP = nearest.p.toFixed(3) + ' kg·m/s';
          tipT = e.T.toFixed(3) + ' J';
          tipV = e.V.toFixed(3) + ' J';
          const rect = containerEl.getBoundingClientRect();
          tooltipLeft = event.clientX - rect.left + 14;
          tooltipTop  = event.clientY - rect.top  - 10;
          tooltipVisible = true;

          particleGrp.selectAll('.hover-dot').remove();

          // Lagrange-Dot (linke Skala, ẋ)
          if (mode === 'lagrange' || mode === 'both') {
            particleGrp.append('circle').attr('class', 'hover-dot')
              .attr('cx', curX(nearest.x)).attr('cy', curY(nearest.p / m))
              .attr('r', 5).attr('fill', COLOR_LAGRANGE).attr('filter', 'url(#glow-particle)');
          }
          // Hamilton-Dot (rechte Skala, p)
          if (mode === 'hamilton') {
            particleGrp.append('circle').attr('class', 'hover-dot')
              .attr('cx', curX(nearest.x)).attr('cy', curY(nearest.p))
              .attr('r', 5).attr('fill', COLOR_HAMILTON).attr('filter', 'url(#glow-particle)');
          }
          if (mode === 'both' && curYH) {
            particleGrp.append('circle').attr('class', 'hover-dot')
              .attr('cx', curX(nearest.x)).attr('cy', curYH(nearest.p))
              .attr('r', 5).attr('fill', COLOR_HAMILTON).attr('filter', 'url(#glow-particle)');
          }

          onLiveUpdate(tipX, tipP, e.E.toFixed(3) + ' J', e.omega.toFixed(3) + ' rad/s');
        } else {
          tooltipVisible = false;
          particleGrp.selectAll('.hover-dot').remove();
        }
      })
      .on('mouseleave', () => {
        tooltipVisible = false;
        particleGrp?.selectAll('.hover-dot').remove();
      });

    const firstPoint = lastPoints.find(p => p !== null)!;
    const e0 = await Runtime.runPromise(rt)(computePointEnergy(firstPoint, { m, k, gamma, x0, p0 }));
    onLiveUpdate(
      firstPoint.x.toFixed(3) + ' m',
      firstPoint.p.toFixed(3) + ' kg·m/s',
      e0.E.toFixed(3) + ' J',
      e0.omega.toFixed(3) + ' rad/s'
    );
  }

  // ─── Animation ───────────────────────────────────────────────────────────────

  function startAnimation() {
    if (isAnimating) stopAnimation();
    isAnimating = true;
    animX = x0;
    animP = p0;
    trail = [];
    stepsSinceLastDraw = 0;
    animStepCount = 0;
    animLoop();
  }

  function stopAnimation() {
    isAnimating = false;
    if (animFrameId !== null) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    particleGrp?.selectAll('.anim-trail, .anim-dot').remove();
  }

  function animLoop() {
    if (!isAnimating || !particleGrp || !baseXScale || !baseYScale) return;

    const xSc  = currentTransform.rescaleX(baseXScale);
    const ySc  = currentTransform.rescaleY(baseYScale);
    const yScH = baseYScaleHamilton ? currentTransform.rescaleY(baseYScaleHamilton) : null;

    const dt = 0.04;
    const F1 = -(k * animX) - (gamma * animP / m);
    animX += (animP / m) * dt + 0.5 * (F1 / m) * dt * dt;
    const F2 = -(k * animX) - (gamma * animP / m);
    animP += 0.5 * (F1 + F2) * dt;

    animStepCount++;

    // Feder-Abbruch: klassische Bedingungen (unverändert)
    const tooFar     = Math.abs(animX) > 20;
    const almostZero = gamma > 0 && Math.abs(animX) < 0.05 && Math.abs(animP) < 0.05;
    const springDone = tooFar || almostZero;

    // Diagramm-Abbruch: bei negativer Dämpfung erst nach 900 Steps
    const negDampDone = gamma < 0 && animStepCount >= 900;
    const diagDone    = (gamma >= 0 && springDone) || negDampDone;

    if (springDone && !keepRunning) {
      if (gamma < 0) {
        // Feder endet, Diagramm läuft weiter → keepRunning verhindert $effect-Stop
        keepRunning = true;
        onAnimEnd();
      } else {
        // γ >= 0: beides stoppt
        stopAnimation();
        onAnimEnd();
        return;
      }
    }
    if (diagDone) {
      keepRunning = false;
      stopAnimation();
      return;
    }

    if (animStepCount > 900) {
      lastPoints.push({ x: animX, p: animP });
      stepsSinceLastDraw++;
      if (stepsSinceLastDraw >= PATH_REDRAW_INTERVAL) {
        stepsSinceLastDraw = 0;
        drawOrbits(
          currentTransform.rescaleX(baseXScale),
          currentTransform.rescaleY(baseYScale),
          lastPoints,
          baseYScaleHamilton ? currentTransform.rescaleY(baseYScaleHamilton) : null
        );
      }
    }

    trail.push({ x: animX, p: animP });
    if (trail.length > TRAIL_LENGTH) trail.shift();

    particleGrp.selectAll('.anim-trail, .anim-dot').remove();

    // Trail zeichnen
    trail.forEach((pt, i) => {
      const alpha = i / trail.length;
      // Lagrange-Trail (linke Skala)
      if (mode === 'lagrange' || mode === 'both') {
        particleGrp.append('circle').attr('class', 'anim-trail')
          .attr('cx', xSc(pt.x)).attr('cy', ySc(pt.p / m))
          .attr('r', 1.5 + 2.5 * alpha).attr('fill', COLOR_LAGRANGE).attr('opacity', alpha * 0.45);
      }
      // Hamilton-Trail
      if (mode === 'hamilton') {
        particleGrp.append('circle').attr('class', 'anim-trail')
          .attr('cx', xSc(pt.x)).attr('cy', ySc(pt.p))
          .attr('r', 1.5 + 2.5 * alpha).attr('fill', COLOR_HAMILTON).attr('opacity', alpha * 0.45);
      }
      if (mode === 'both' && yScH) {
        particleGrp.append('circle').attr('class', 'anim-trail')
          .attr('cx', xSc(pt.x)).attr('cy', yScH(pt.p))
          .attr('r', 1.5 + 2.5 * alpha).attr('fill', COLOR_HAMILTON).attr('opacity', alpha * 0.45);
      }
    });

    // Hauptpartikel
    if (mode === 'lagrange' || mode === 'both') {
      particleGrp.append('circle').attr('class', 'anim-dot')
        .attr('cx', xSc(animX)).attr('cy', ySc(animP / m))
        .attr('r', 7).attr('fill', COLOR_LAGRANGE).attr('filter', 'url(#glow-particle)');
    }
    if (mode === 'hamilton') {
      particleGrp.append('circle').attr('class', 'anim-dot')
        .attr('cx', xSc(animX)).attr('cy', ySc(animP))
        .attr('r', 7).attr('fill', COLOR_HAMILTON).attr('filter', 'url(#glow-particle)');
    }
    if (mode === 'both' && yScH) {
      particleGrp.append('circle').attr('class', 'anim-dot')
        .attr('cx', xSc(animX)).attr('cy', yScH(animP))
        .attr('r', 7).attr('fill', COLOR_HAMILTON).attr('filter', 'url(#glow-particle)');
    }

    Runtime.runPromise(rt)(computePointEnergy({ x: animX, p: animP }, { m, k, gamma, x0, p0 })).then(e => {
      onLiveUpdate(
        animX.toFixed(3) + ' m',
        animP.toFixed(3) + ' kg·m/s',
        e.E.toFixed(3) + ' J',
        e.omega.toFixed(3) + ' rad/s'
      );
    });

    animFrameId = requestAnimationFrame(() => animLoop());
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  let resizeObs: ResizeObserver;

  onMount(() => {
    svgSel = d3.select(svgEl);
    draw();
    resizeObs = new ResizeObserver(() => draw());
    resizeObs.observe(containerEl);
  });

  onDestroy(() => {
    resizeObs?.disconnect();
    stopAnimation();
  });

  $effect(() => {
    void m; void k; void gamma; void x0; void p0; void mode;
    stopAnimation();
    onAnimEnd();
    draw();
  });

  $effect(() => {
    if (animating) { keepRunning = false; startAnimation(); }
    else if (!keepRunning) stopAnimation();
  });
</script>

<main class="p-6 flex flex-col gap-3 min-h-0">

  <div class="flex items-center gap-3 min-h-[24px]">
    <span class="text-[0.62rem] uppercase tracking-widest
      {mode === 'both' ? 'text-error-400' : mode === 'hamilton' ? 'text-primary-400' : 'text-warning-400'}">
      {plotTitle}
    </span>
    {#if mode === 'both'}
      <span class="text-[0.6rem] px-2 py-0.5 rounded border border-warning-400/30 bg-warning-400/10 text-warning-400 uppercase tracking-widest">Lagrange ẋ</span>
      <span class="text-[0.6rem] px-2 py-0.5 rounded border border-primary-400/30 bg-primary-400/10 text-primary-400 uppercase tracking-widest">Hamilton p</span>
    {/if}
    {#if gamma > 0}
      <span class="text-[0.6rem] px-2 py-0.5 rounded border border-rose-400/30 bg-rose-400/10 text-rose-400 uppercase tracking-widest">gedämpft</span>
    {/if}
  </div>

  <div
    bind:this={containerEl}
    class="relative flex-1 rounded-xl overflow-hidden
           border border-surface-700 bg-surface-900"
  >
    <svg bind:this={svgEl} class="block w-full h-full"></svg>

    <PhaseTooltip
      visible={tooltipVisible}
      left={tooltipLeft}
      top={tooltipTop}
      x={tipX}
      p={tipP}
      T={tipT}
      V={tipV}
    />
  </div>
</main>