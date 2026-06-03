<script lang="ts">
  type Props = {
    visible: boolean;
    left:    number;
    top:     number;
    x:       string;
    p:       string;
    T:       string;
    V:       string;
  };
  const { visible, left, top, x, p, T, V }: Props = $props();
</script>

{#if visible}
  <div
    class="absolute z-10 pointer-events-none
           bg-surface-800 border border-surface-600
           rounded-lg px-3 py-2.5 text-[0.68rem]
           backdrop-blur-sm shadow-2xl"
    style="left:{left}px; top:{top}px;"
  >
    <div><span class="text-warning-500">x</span> = {x}</div>
    <div><span class="text-primary-500">p</span> = {p}</div>
    <div><span class="text-surface-200">T</span> = {T}</div>
    <div><span class="text-surface-200">V</span> = {V}</div>
  </div>
{/if}
