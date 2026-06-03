<script lang="ts">
  import type { Mode } from './physics';
  import PhaseHeader  from './PhaseHeader.svelte';
  import PhaseSidebar from './PhaseSidebar.svelte';
  import PhaseCanvas  from './PhaseCanvas.svelte';
  import SpringVisualization from './Springvisualization.svelte';
  import { onMount } from 'svelte';

//  onMount(async() => { 
//     const response = await fetch("http://127.0.0.1:3000/example");
//    if (!response.ok) {
//      throw new Error(`Response status: ${response.status}`);
//    }
//
//  })

  let m     = $state(1.0);
  let k     = $state(1.0);
  let gamma = $state(0.0);
  let x0    = $state(2.0);
  let p0    = $state(0.0);
  let mode  = $state<Mode>('lagrange');
  let animating = $state(false);
  let liveX = $state('—');
  let liveP = $state('—');
  let liveE = $state('—');
  let liveW = $state('—');
  let currentX = $state(2.0);

  function handleModeChange(newMode: Mode)           { mode = newMode; }
  function handleToggleAnimation()                   { animating = !animating; }
  function handleLiveUpdate(x: string, p: string, E: string, w: string) {
    liveX = x; liveP = p; liveE = E; liveW = w;
    const xVal = parseFloat(x);
    if (!isNaN(xVal)) currentX = xVal;
  }
  function handleParamChange(bind: string, v: number) {
    if (bind === 'M')  m     = v;
    if (bind === 'K')  k     = v;
    if (bind === 'G')  gamma = v;
    if (bind === 'X0') x0    = v;
    if (bind === 'P0') p0    = v;
  }
  function handleSpringDrag(newX0: number) {
    x0 = newX0;
    animating = true;
  }
</script>

  <!-- WIP Banner 
  <div class="flex items-center gap-3 px-8 py-2.5 bg-warning-800 border-b border-warning-500/20 text-warning-300 text-xs">
    <span class="shrink-0">⚠</span>
    <p>Diese Seite befindet sich im Aufbau – Inhalte können unvollständig oder fehlerhaft sein.</p>
  </div>-->

<div
  class=" bg-surface-950 text-surface-50 overflow-x-hidden"
  style="font-family: 'DM Mono', monospace;"
>
  <div class="grid h-screen grid-cols-[320px_1fr] lg:grid-cols-[320px_1fr_280px] grid-rows-[auto_1fr]">

    <!-- Header spans alle Spalten -->
    <div class="col-span-2 lg:col-span-3">
      <PhaseHeader dampingActive={gamma > 0} {mode} />
    </div>

    <PhaseSidebar
      {m} {k} {gamma} {x0} {p0}
      {mode} {animating}
      {liveX} {liveP} {liveE} {liveW}
      onModeChange={handleModeChange}
      onParamChange={handleParamChange}
      onToggleAnimation={handleToggleAnimation}
    />

    <PhaseCanvas
      {m} {k} {gamma} {x0} {p0}
      {mode} {animating}
      onLiveUpdate={handleLiveUpdate}
      onAnimEnd={() => { animating = false; }}
    />

    <SpringVisualization
      {x0}
      {p0}
      {m}
      {k}
      {animating}
      currentX={currentX}
      onDragEnd={handleSpringDrag}
    />

  </div>
</div>