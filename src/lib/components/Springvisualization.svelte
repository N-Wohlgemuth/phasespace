<script lang="ts">
  type Props = {
    x0:        number;
    p0:        number;
    m:         number;
    k:         number;
    animating: boolean;
    currentX:  number;
    onDragEnd: (newX0: number) => void;
  };

  const { x0, p0, m, k, animating, currentX, onDragEnd }: Props = $props();

  let containerEl  = $state<HTMLDivElement | undefined>(undefined);
  let isDragging   = $state(false);
  let dragStartY   = 0;
  let tempPosition = $state(0);

  const svgWidth = 260;
  let svgHeight  = $state(500);

  $effect(() => {
    function updateHeight() {
      requestAnimationFrame(() => {
        if (!containerEl) return;
        const h = containerEl.clientHeight;
        if (h > 0) svgHeight = h;
      });
    }

    window.addEventListener('resize', updateHeight);
    updateHeight();

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  });

  const MASS_SIZE = $derived(Math.min(36, svgWidth * 0.14));
  const CENTER_X  = $derived(svgWidth  / 2);
  const CENTER_Y  = $derived(svgHeight / 2);
  const RULER_X   = 42;

  const maxAmp = $derived.by(() => {
    const E = 0.5 * k * x0 ** 2 + 0.5 * p0 ** 2 / m;
    return Math.sqrt((2 * E) / k) + 0.5;
  });

  const SCALE = $derived.by(() =>
    (svgHeight / 2 - MASS_SIZE - 10) / maxAmp
  );

  const SPRING_SEGMENT_HEIGHT = $derived(Math.min(12, svgHeight / 80));

  const tickStep = $derived.by(() => {
    const minPixels = 20;
    for (const s of [0.25, 0.5, 1, 2, 5, 10]) {
      if (s * SCALE >= minPixels) return s;
    }
    return 10;
  });

  const rulerTicks = $derived.by(() => {
    const ticks: { y: number; label: string; major: boolean }[] = [];
    const minor = tickStep / 2;
    const total = Math.ceil(maxAmp / minor) + 1;
    for (let i = -total; i <= total; i++) {
      const v = Math.round(i * minor * 100) / 100;
      if (Math.abs(v) > maxAmp + 0.01) continue;
      const isMajor = Math.abs(Math.round(v / tickStep) * tickStep - v) < 0.001;
      ticks.push({
        y:     CENTER_Y - v * SCALE,
        label: v === 0 ? '0' : v % 1 === 0 ? String(v) : v.toFixed(tickStep < 1 ? 2 : 1),
        major: isMajor,
      });
    }
    return ticks;
  });

  $effect(() => {
    if (!isDragging) {
      tempPosition = animating ? currentX : x0;
    }
  });

  function handlePointerDown(e: PointerEvent) {
    if (animating) return;
    isDragging = true;
    dragStartY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    const delta = -(e.clientY - dragStartY) / SCALE;
    tempPosition = Math.max(-maxAmp + 0.1, Math.min(maxAmp - 0.1, x0 + delta));
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (tempPosition !== x0) {
      onDragEnd(tempPosition);
    }
  }

  const pixelPosition = $derived(CENTER_Y - tempPosition * SCALE);

  const springSegments = $derived(
    Math.max(0, Math.floor(Math.abs(pixelPosition - CENTER_Y) / SPRING_SEGMENT_HEIGHT))
  );
</script>

<aside class="border-l border-surface-700 bg-surface-900/30 p-4 flex flex-col items-center gap-4 overflow-hidden hidden lg:flex">

  <div
    bind:this={containerEl}
    class="relative w-full flex-1 rounded-lg bg-surface-950/50 border border-surface-700"
  >
    <svg
      class="w-full h-full"
      viewBox="0 0 {svgWidth} {svgHeight}"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Meterleiste -->
      <line
        x1={RULER_X} y1={CENTER_Y - maxAmp * SCALE}
        x2={RULER_X} y2={CENTER_Y + maxAmp * SCALE}
        class="stroke-surface-400" stroke-width="1.5" opacity="0.4"
      />
      {#each rulerTicks as tick}
        <line
          x1={tick.major ? RULER_X - 8 : RULER_X - 4}
          y1={tick.y}
          x2={RULER_X}
          y2={tick.y}
          class="stroke-surface-400"
          opacity={tick.major ? 0.7 : 0.35}
          stroke-width={tick.major ? 1.5 : 1}
        />
        {#if tick.major}
          <text
            x={RULER_X - 11}
            y={tick.y + 4}
            text-anchor="end"
            class="fill-surface-300"
            font-size="9"
          >{tick.label}</text>
        {/if}
      {/each}
      <text
        x={RULER_X}
        y={CENTER_Y - maxAmp * SCALE - 6}
        text-anchor="middle"
        class="fill-surface-400"
        font-size="9"
      >m</text>

      <!-- Pfeil -->
      <line
        x1={RULER_X + 2} y1={pixelPosition}
        x2={RULER_X + 20} y2={pixelPosition}
        class="stroke-primary-400"
        stroke-width="1.5" stroke-dasharray="3,2"
      />
      <circle cx={RULER_X + 1} cy={pixelPosition} r="3" class="fill-primary-400" />

      <!-- Mittelachse -->
      <line
        x1={CENTER_X} y1="0"
        x2={CENTER_X} y2={svgHeight}
        class="stroke-surface-600"
        stroke-width="1" stroke-dasharray="4,4"
      />

      <!-- Nullpunkt -->
      <line
        x1={CENTER_X - 22} y1={CENTER_Y}
        x2={CENTER_X + 22} y2={CENTER_Y}
        class="stroke-surface-400"
        stroke-width="1.5" opacity="0.5"
      />
      <text x={CENTER_X + 27} y={CENTER_Y + 4} class="fill-surface-400" font-size="10">x=0</text>

      <!-- Feder -->
      <g>
        {#each Array(springSegments) as _, i}
          {@const segmentStart = CENTER_Y + (i / springSegments) * (pixelPosition - CENTER_Y)}
          {@const segmentEnd   = CENTER_Y + ((i + 1) / springSegments) * (pixelPosition - CENTER_Y)}
          <line
            x1={CENTER_X}
            y1={segmentStart}
            x2={CENTER_X + (i % 2 === 0 ? 14 : -14)}
            y2={segmentEnd}
            class="stroke-warning-400"
            stroke-width="2.5"
          />
        {/each}
      </g>

      <!-- Masse -->
      <g
        role="button"
        tabindex="0"
        aria-label="Masse - ziehen um Position zu aendern"
        style="cursor: {isDragging ? 'grabbing' : animating ? 'default' : 'grab'}"
        onpointerdown={handlePointerDown}
        onpointermove={handlePointerMove}
        onpointerup={handlePointerUp}
      >
        <rect
          x={CENTER_X - MASS_SIZE/2}
          y={pixelPosition - MASS_SIZE/2}
          width={MASS_SIZE}
          height={MASS_SIZE}
          class="fill-primary-500 stroke-primary-300"
          stroke-width="2"
          rx="4"
        />
        <text
          x={CENTER_X}
          y={pixelPosition + 5}
          text-anchor="middle"
          class="fill-primary-50"
          font-size="13"
          font-weight="600"
        >m</text>
      </g>

      <!-- Position Label -->
      <text x={CENTER_X + 28} y={pixelPosition - 22} class="fill-primary-300" font-size="11">
        {tempPosition.toFixed(2)} m
      </text>
    </svg>
  </div>

  <p class="text-xs text-surface-400 text-center">
    {isDragging ? 'Ziehe die Masse um x0 zu aendern' : animating ? 'Animation laeuft' : 'Masse ziehen um zu starten'}
  </p>
</aside>