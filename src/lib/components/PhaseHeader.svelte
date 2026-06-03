<script lang="ts">
  import { page } from '$app/stores';
  import type { Mode } from './physics';

  type Props = {
    dampingActive: boolean;
    mode: Mode;
  };
  const { dampingActive, mode }: Props = $props();

  const nav = [
    { href: '/',        label: 'Simulation' },
    { href: '/symbole', label: 'Symbole'    },
    { href: '/theorie', label: 'Theorie'    },
  ];
</script>

<header
  class="col-span-2 lg:col-span-3 flex items-baseline gap-4 px-8 py-5
         border-b border-surface-700
         bg-surface-950/80 backdrop-blur-md
         sticky top-0 z-20"
>
  <h1 class="text-2xl font-light tracking-tight" style="font-family: 'Fraunces', serif;">
    Phasen<em class="not-italic {mode === 'hamilton' ? 'text-primary-500' : mode === 'both' ? 'text-error-500' : 'text-warning-500'}">diagramm</em>
  </h1>
  <span class="text-[0.6rem] px-2 py-0.5 rounded border tracking-wider uppercase text-warning-500 border-warning-500/30 bg-warning-500/10">Lagrange</span>
  <span class="text-[0.6rem] px-2 py-0.5 rounded border tracking-wider uppercase text-primary-500 border-primary-500/30 bg-primary-500/10">Hamilton</span>
  {#if dampingActive}
    <span class="text-[0.6rem] px-2 py-0.5 rounded border tracking-wider uppercase text-error-500 border-error-500/30 bg-error-500/10">gedämpft</span>
  {/if}

  <nav class="ml-auto flex items-center gap-1">
    {#each nav as item}
      <a
        href={item.href}
        class="text-[0.65rem] px-3 py-1.5 rounded tracking-wider uppercase transition-colors
               {($page.url.pathname as string) === item.href
                 ? 'text-surface-50 bg-surface-700/70 border border-surface-600'
                 : 'text-surface-300 hover:text-surface-50 hover:bg-surface-700/50'}"
      >{item.label}</a>
    {/each}
  </nav>
</header>