<script lang="ts">
  import type { Mode } from './physics';
  import { fade } from 'svelte/transition';
  import { Slider, Tabs } from '@skeletonlabs/skeleton-svelte';
  import { Effect, Duration } from 'effect';
  import { login, register, logout, loginAsGuest, isLoggedIn, isGuest, user, authError } from './stores/auth';
  import { presetList, presetError, loadPresets, savePreset, removePreset, renamePreset } from './stores/presets';
  import type { Preset } from './stores/presets';

  // ─── Typen ───────────────────────────────────────────────────────────────────

  // cls und fmt entfernt — werden im Template nicht verwendet
  type SliderRow = {
    label:  string;
    bind:   string;
    min:    number;
    max:    number;
    step:   number;
    unit:   string;
  };

  type Props = {
    m:         number;
    k:         number;
    gamma:     number;
    x0:        number;
    p0:        number;
    mode:      Mode;
    animating: boolean;
    liveX:     string;
    liveP:     string;
    liveE:     string;
    liveW:     string;
    onModeChange:      (m: Mode) => void;
    onParamChange:     (bind: string, v: number) => void;
    onToggleAnimation: () => void;
  };

  const {
    m, k, gamma, x0, p0,
    mode, animating,
    liveX, liveP, liveE, liveW,
    onModeChange,
    onParamChange,
    onToggleAnimation,
  }: Props = $props();

  // ─── Input-Felder State ───────────────────────────────────────────────────────

  const inputState: Record<string, string> = $state({
    M: '', K: '', G: '', X0: '', P0: '',
  });

  // Ein einziger $effect synchronisiert alle 5 Felder wenn Props sich ändern
  $effect(() => {
    inputState['M']  = String(m);
    inputState['K']  = String(k);
    inputState['G']  = String(gamma);
    inputState['X0'] = String(x0);
    inputState['P0'] = String(p0);
  });

  function commitInput(bind: string, raw: string, min: number, max: number) {
    const parsed = parseFloat(raw.replace(',', '.'));
    if (isNaN(parsed)) {
      inputState[bind] = String(getVal(bind));
      return;
    }
    const clamped = Math.min(max, Math.max(min, parsed));
    onParamChange(bind, clamped);
    inputState[bind] = String(clamped);
  }

  // ─── Auth State ──────────────────────────────────────────────────────────────

  let authTab       = $state<'login' | 'register' | 'guest'>('login');
  let username      = $state('');
  let password      = $state('');
  let authLoading   = $state(false);
  let newPresetName = $state('');
  let saveLoading   = $state(false);
  let renamingPreset = $state<string | null>(null);
  let renameValue    = $state('');
  let activePreset   = $state<string | null>(null);
  let updateFeedback = $state(false);

  // ─── Effect-TS Handlers ──────────────────────────────────────────────────────

  // Effect.ensuring garantiert authLoading = false auch bei Fehlern (wie finally)
  async function handleAuth() {
    authLoading = true;
    await Effect.runPromise(
      Effect.tryPromise(() =>
        authTab === 'login' ? login(username, password) : register(username, password)
      ).pipe(
        Effect.flatMap((ok) =>
          ok
            ? Effect.tryPromise(() => loadPresets()).pipe(
                Effect.tap(() => Effect.sync(() => { username = ''; password = ''; }))
              )
            : Effect.void
        ),
        Effect.catchAll(() => Effect.void),
        Effect.ensuring(Effect.sync(() => { authLoading = false; }))
      )
    );
  }

  async function handleSave() {
    if (!newPresetName.trim()) return;
    saveLoading = true;
    await Effect.runPromise(
      Effect.tryPromise(() =>
        savePreset({ name: newPresetName.trim(), m, k, gamma, x0, p0, mode })
      ).pipe(
        Effect.tap(() => Effect.sync(() => { newPresetName = ''; })),
        Effect.catchAll(() => Effect.void),
        Effect.ensuring(Effect.sync(() => { saveLoading = false; }))
      )
    );
  }

  // Effect.sleep ersetzt setTimeout — deklarativer und komponierbar
  async function handleUpdate() {
    if (!activePreset) return;
    await Effect.runPromise(
      Effect.tryPromise(() =>
        savePreset({ name: activePreset!, m, k, gamma, x0, p0, mode })
      ).pipe(
        Effect.tap(() => Effect.sync(() => { updateFeedback = true; })),
        Effect.flatMap(() => Effect.sleep(Duration.millis(1500))),
        Effect.tap(() => Effect.sync(() => { updateFeedback = false; })),
        Effect.catchAll(() => Effect.void)
      )
    );
  }

  async function handleRename(oldName: string) {
    if (!renameValue.trim() || renameValue.trim() === oldName) {
      renamingPreset = null;
      return;
    }
    await renamePreset(oldName, renameValue.trim());
    renamingPreset = null;
  }

  function handleLoadPreset(p: Preset) {
    onParamChange('M',  p.m);
    onParamChange('K',  p.k);
    onParamChange('G',  p.gamma);
    onParamChange('X0', p.x0);
    onParamChange('P0', p.p0);
    onModeChange(p.mode as Mode);
    activePreset = p.name;
  }

  // ─── MathJax ─────────────────────────────────────────────────────────────────

  // Beim Moduswechsel kurz ausblenden → kein LaTeX-Flash
  // Beim ersten Render (Remount) sofort sichtbar → kein dauerhaftes Verstecken
  let formulaVisible = $state(true);
  let isMounted = false;

  async function typeset(hide: boolean) {
    if (hide) formulaVisible = false;
    await new Promise<void>((resolve) => {
      const check = () => {
        if (window.MathJax?.typesetPromise && window.MathJax?.startup?.promise !== undefined) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
    await window.MathJax!.startup!.promise;
    await window.MathJax!.typesetPromise!();
    formulaVisible = true;
  }

  $effect(() => {
    void mode;
    // isMounted=false beim ersten Durchlauf → nicht ausblenden (Remount-Fall)
    typeset(isMounted);
    isMounted = true;
  });

  // ─── Statische Konstanten ────────────────────────────────────────────────────

  // $derived entfernt — hängt von keinem reaktiven State ab
  const sliderRows: SliderRow[] = [
    { label: String.raw`Masse \(m\)`,           bind: 'M',  min: 0.5, max: 3,  step: 0.1,  unit: String.raw`\(\mathrm{kg}\)`          },
    { label: String.raw`Federkonstante \(k\)`,  bind: 'K',  min: 0.5, max: 5,  step: 0.1,  unit: String.raw`\(\mathrm{N/m}\)`         },
    { label: String.raw`Dämpfung \(\gamma\)`,   bind: 'G',  min: -1,  max: 1,  step: 0.01, unit: String.raw`\(\mathrm{kg/s}\)`        },
    { label: String.raw`Anfangspos. \(x_{0}\)`, bind: 'X0', min: -4,  max: 4,  step: 0.1,  unit: String.raw`\(\mathrm{m}\)`           },
    { label: String.raw`Anfangsimp. \(p_{0}\)`, bind: 'P0', min: -3,  max: 3,  step: 0.1,  unit: String.raw`\(\mathrm{kg\cdot m/s}\)` },
  ];

  // Funktion → const Array
  const modes = [
    { val: 'lagrange', label: 'Lagrange', activeCls: 'bg-warning-500/20 text-warning-400' },
    { val: 'hamilton', label: 'Hamilton', activeCls: 'bg-primary-500/20 text-primary-400' },
    { val: 'both',     label: 'Beide',    activeCls: 'bg-error-500/20 text-error-400'     },
  ];

  const authTabs = [
    { val: 'login',    label: 'Anmelden'     },
    { val: 'register', label: 'Registrieren' },
    { val: 'guest',    label: 'Gast'         },
  ] as const;

  // ─── Reaktive Derived ────────────────────────────────────────────────────────

  type FormulaSegment = { cls: string; text: string };
  type FormulaLine = { segments: FormulaSegment[] } | { cls: string; text: string };

  const formulaLines = $derived<FormulaLine[]>(
    mode === 'hamilton'
      ? [
          { cls: 'text-primary-400', text: String.raw`\(H = T + V\)` },
          { cls: 'text-surface-200', text: String.raw`\(T = \dfrac{p^{2}}{2m}\)` },
          { cls: 'text-surface-200', text: String.raw`\(V = \dfrac{1}{2}kx^{2}\)` },
          { cls: 'text-primary-400', text: String.raw`\(\dot{x} = \dfrac{\partial H}{\partial p} = \dfrac{p}{m}\)` },
          { cls: 'text-primary-400', text: String.raw`\(\dot{p} = -\dfrac{\partial H}{\partial x} = -kx\)` },
        ]
      : mode === 'lagrange'
      ? [
          { cls: 'text-warning-400', text: String.raw`\(L = T - V\)` },
          { cls: 'text-surface-200', text: String.raw`\(T = \dfrac{1}{2}m\dot{x}^{2}\)` },
          { cls: 'text-surface-200', text: String.raw`\(V = \dfrac{1}{2}kx^{2}\)` },
          { cls: 'text-warning-400', text: String.raw`\(\dfrac{d}{dt}\dfrac{\partial L}{\partial \dot{x}} = \dfrac{\partial L}{\partial x}\)` },
          { cls: 'text-surface-200', text: String.raw`\(m\ddot{x} + kx = 0\)` },
        ]
      : [
          { segments: [
              { cls: 'text-warning-400', text: String.raw`\(L = T - V\)` },
              { cls: 'text-rose-400',    text: '  ↔  ' },
              { cls: 'text-primary-400', text: String.raw`\(H = T + V\)` },
            ]
          },
          { cls: 'text-warning-400', text: 'Euler-Lagrange-Gleichung' },
          { cls: 'text-primary-400', text: 'Hamiltonsche Gleichungen' },
          { cls: 'text-surface-200', text: 'Äquivalente Systeme'      },
        ]
  );

  const liveRows = $derived([
    { label: 'Position x', val: liveX, cls: 'text-warning-400' },
    { label: 'Impuls p',   val: liveP, cls: 'text-primary-400' },
    { label: 'Energie E',  val: liveE, cls: 'text-surface-200' },
    { label: 'Frequenz ω', val: liveW, cls: 'text-surface-200' },
  ]);

  function getVal(bind: string): number {
    if (bind === 'M')  return m;
    if (bind === 'K')  return k;
    if (bind === 'G')  return gamma;
    if (bind === 'X0') return x0;
    return p0;
  }

  const hintX = String.raw`\(\lvert x\rvert \lt 0{,}05\,\mathrm{m}\)`;
  const hintP = String.raw`\(\lvert p\rvert \lt 0{,}05\,\mathrm{kg{\cdot}m/s}\)`;
</script>

<aside class="border-r border-surface-700/40 bg-surface-900/50 p-6 flex flex-col gap-5 overflow-y-auto custom-scroll-color-primary-800">

  <!-- Formalismus-Tabs — Skeleton Tabs, per-Tab Farbe über mode-Vergleich -->
  <section>
    <p class="text-xs uppercase tracking-widest text-surface-300 mb-3">Formalismus</p>
    <Tabs
      value={mode}
      onValueChange={(e) => onModeChange(e.value as Mode)}
    >
      <Tabs.List class="flex gap-1 bg-surface-950 p-1 rounded-xl border border-surface-700">
        {#each modes as tab}
          <Tabs.Trigger
            value={tab.val}
            class="flex-1 py-2 text-xs rounded-lg transition-all duration-200 cursor-pointer
              {mode === tab.val ? tab.activeCls : 'text-surface-300 hover:text-surface-50'}"
          >
            {tab.label}
          </Tabs.Trigger>
        {/each}
      </Tabs.List>
    </Tabs>
  </section>

  <!-- Parameter-Schieberegler -->
  <section>
    <p class="text-xs uppercase tracking-widest text-surface-300 mb-3">Parameter</p>
    <div class="grid grid-cols-[1fr_5rem_auto] items-center gap-x-2 gap-y-2">
      {#each sliderRows as row (row.bind)}
        <span class="text-xs">{@html row.label}</span>

        <input
          type="number"
          min={row.min}
          max={row.max}
          step={row.step}
          value={inputState[row.bind]}
          class="w-full bg-surface-950 border border-surface-700 rounded-md px-2 py-0.5
                 text-xs text-right tabular-nums text-surface-100
                 focus:outline-none focus:border-primary-500
                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          oninput={(e) => { inputState[row.bind] = (e.target as HTMLInputElement).value; }}
          onblur={(e)  => commitInput(row.bind, (e.target as HTMLInputElement).value, row.min, row.max)}
          onkeydown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        />

        <span class="text-[0.65rem] text-surface-500 whitespace-nowrap">
          {#if row.unit}{@html row.unit}{/if}
        </span>

        <div class="col-span-3 -mt-1 mb-1">
          <Slider
            min={row.min}
            max={row.max}
            step={row.step}
            value={[getVal(row.bind)]}
            onValueChange={(e) => onParamChange(row.bind, e.value[0])}
            onValueChangeEnd={(e) => onParamChange(row.bind, e.value[0])}
          >
            <Slider.Control class="relative h-4 flex items-center">
              <Slider.Track class="bg-primary-50-950 h-1 rounded-full absolute w-full">
                <Slider.Range class="bg-primary-500 rounded-full" />
              </Slider.Track>
              <Slider.Thumb index={0} class="ring-primary-500 size-2 rounded-full bg-white z-10">
                <Slider.HiddenInput />
              </Slider.Thumb>
            </Slider.Control>
          </Slider>
        </div>
      {/each}
    </div>

    <div class="mt-4">
      <p class="text-xs uppercase tracking-widest text-surface-300 mb-3">Hinweis</p>
      <p class="text-xs text-surface-400 leading-relaxed">
       Animation bricht ab bei {@html hintX} und {@html hintP}.
      </p>
    </div>

    {#if activePreset}
      <div class="mt-3">
        <button
          class="w-full px-3 py-1.5 border rounded-lg text-xs transition-colors cursor-pointer
            {updateFeedback
              ? 'bg-success-500/20 text-success-400 border-success-500/30'
              : 'bg-warning-500/20 text-warning-400 border-warning-500/30 hover:bg-warning-500/30'}"
          onclick={handleUpdate}>
          {updateFeedback ? 'Aktualisiert ✓' : `${activePreset} — Aktualisieren`}
        </button>
      </div>
    {/if}
  </section>

  <!-- Gleichungen — versteckt bis MathJax typsetzt (kein LaTeX-Flash) -->
  <section>
    <p class="text-xs uppercase tracking-widest text-surface-300 mb-3">Gleichungen</p>
    <div class="bg-surface-950 border border-surface-700 rounded-xl p-4 text-sm leading-loose min-h-[7rem]">
      {#if formulaVisible}
        <div transition:fade={{ duration: 150 }}>
          {#each formulaLines as line (line)}
            <div class="whitespace-nowrap">
              {#if 'segments' in line}
                {#each line.segments as seg}
                  <span class={seg.cls}>{@html seg.text}</span>
                {/each}
              {:else}
                <span class={line.cls}>{@html line.text}</span>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>

  <!-- Live-Werte -->
  <section>
    <p class="text-xs uppercase tracking-widest text-surface-300 mb-3">Aktuelle Werte</p>
    <div class="flex flex-col divide-y divide-surface-700">
      {#each liveRows as row (row.label)}
        <div class="flex justify-between py-2 text-[0.7rem]">
          <span class="text-surface-300">{row.label}</span>
          <span class="{row.cls} font-medium tabular-nums">{row.val}</span>
        </div>
      {/each}
    </div>
  </section>

  <!-- Account -->
  <section>
    {#if $isLoggedIn}
      <div class="flex justify-between items-center mb-3">
        <div>
          <p class="text-xs uppercase tracking-widest text-surface-300">Presets — {$user?.username}</p>
          {#if $isGuest}
            <p class="text-xs text-warning-400">Gast — Presets sind öffentlich</p>
          {/if}
        </div>
        <button
          class="btn btn-sm preset-filled-error-700-300 text-xs px-2 py-1"
          onclick={() => logout()}>
          Abmelden
        </button>
      </div>

      <!-- Preset speichern -->
      <div class="flex gap-1 mb-3">
        <input
          class="flex-1 bg-surface-950 border border-surface-700 rounded-lg px-2 py-1.5 text-xs text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary-500"
          placeholder="Preset-Name…"
          bind:value={newPresetName}
          onkeydown={(e) => e.key === 'Enter' && handleSave()}
        />
        <button
          class="px-3 py-1.5 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg text-xs hover:bg-primary-500/30 transition-colors cursor-pointer disabled:opacity-40"
          disabled={saveLoading || !newPresetName.trim()}
          onclick={handleSave}>
          {saveLoading ? '…' : 'Speichern'}
        </button>
      </div>

      {#if $presetError}
        <p class="text-xs text-error-400 mb-2">{$presetError}</p>
      {/if}

      {#if $presetList.length === 0}
        <p class="text-[0.7rem] text-surface-500 text-center py-2">Noch keine Presets</p>
      {:else}
        <div class="flex flex-col gap-1">
          {#each $presetList as preset (preset.name)}
            <div class="flex items-center gap-1 group">
              {#if renamingPreset === preset.name}
                <input
                  class="flex-1 bg-surface-950 border border-primary-500 rounded-lg px-2 py-1.5 text-xs text-surface-100 focus:outline-none"
                  bind:value={renameValue}
                  onkeydown={(e) => {
                    if (e.key === 'Enter') handleRename(preset.name);
                    if (e.key === 'Escape') renamingPreset = null;
                  }}
                />
                <button
                  class="px-2 py-1.5 text-primary-400 hover:text-primary-300 transition-colors cursor-pointer text-xs"
                  onclick={() => handleRename(preset.name)}>
                  ✓
                </button>
              {:else}
                <button
                  class="flex-1 text-left px-2 py-1.5 bg-surface-950 border border-surface-700 rounded-lg text-xs text-surface-200 hover:border-primary-500/50 hover:text-surface-50 transition-colors cursor-pointer truncate"
                  onclick={() => handleLoadPreset(preset)}>
                  {preset.name}
                </button>
                <button
                  class="px-2 py-1.5 text-surface-600 hover:text-surface-300 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 text-xs"
                  title="Umbenennen"
                  onclick={() => { renamingPreset = preset.name; renameValue = preset.name; }}>
                  ✎
                </button>
                <button
                  class="px-2 py-1.5 text-surface-600 hover:text-error-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 text-xs"
                  onclick={() => removePreset(preset.name)}>
                  ✕
                </button>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

    {:else}
      <!-- Auth-Tabs — Skeleton Tabs -->
<!--      <Tabs
        value={authTab}
        onValueChange={(e) => authTab = e.value as typeof authTab}
        class="mb-3"
      >
        <Tabs.List class="flex gap-1 bg-surface-950 p-1 rounded-xl border border-surface-700">
          {#each authTabs as tab}
            <Tabs.Trigger
              value={tab.val}
              class="flex-1 py-1.5 text-xs rounded-lg transition-all duration-200 cursor-pointer
                {authTab === tab.val ? 'bg-primary-500/20 text-primary-400' : 'text-surface-300 hover:text-surface-50'}"
            >
              {tab.label}
            </Tabs.Trigger>
          {/each}
        </Tabs.List>

        <Tabs.Content value="guest" class="pt-3">
          <p class="text-xs text-surface-400 mb-3 leading-relaxed">
            Als Gast gespeicherte Presets sind für alle Gäste sichtbar.
          </p>
          <button
            class="btn preset-tonal-primary w-full text-xs"
            disabled={authLoading}
            onclick={async () => {
              authLoading = true;
              await Effect.runPromise(
                Effect.tryPromise(() => loginAsGuest()).pipe(
                  Effect.flatMap(() => Effect.tryPromise(() => loadPresets())),
                  Effect.catchAll(() => Effect.void),
                  Effect.ensuring(Effect.sync(() => { authLoading = false; }))
                )
              );
            }}>
            {authLoading ? '…' : 'Als Gast fortfahren'}
          </button>
        </Tabs.Content>

        <Tabs.Content value="login" class="pt-3">
          <div class="flex flex-col gap-2">
            <input
              class="bg-surface-950 border border-surface-700 rounded-lg px-2 py-1.5 text-xs text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary-500"
              placeholder="Benutzername"
              bind:value={username}
            />
            <input
              type="password"
              class="bg-surface-950 border border-surface-700 rounded-lg px-2 py-1.5 text-xs text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary-500"
              placeholder="Passwort"
              bind:value={password}
              onkeydown={(e) => e.key === 'Enter' && handleAuth()}
            />
            {#if $authError}
              <p class="text-xs text-error-400">{$authError}</p>
            {/if}
            <button
              class="btn preset-tonal-primary w-full text-xs"
              disabled={authLoading || !username || !password}
              onclick={handleAuth}>
              {authLoading ? '…' : 'Anmelden'}
            </button>
          </div>
        </Tabs.Content>

        <Tabs.Content value="register" class="pt-3">
          <div class="flex flex-col gap-2">
            <input
              class="bg-surface-950 border border-surface-700 rounded-lg px-2 py-1.5 text-xs text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary-500"
              placeholder="Benutzername"
              bind:value={username}
            />
            <input
              type="password"
              class="bg-surface-950 border border-surface-700 rounded-lg px-2 py-1.5 text-xs text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary-500"
              placeholder="Passwort"
              bind:value={password}
              onkeydown={(e) => e.key === 'Enter' && handleAuth()}
            />
            {#if password.length > 0 && password.length < 6}
              <p class="text-xs text-warning-400">Mindestens 6 Zeichen erforderlich.</p>
            {/if}
            {#if $authError}
              <p class="text-xs text-error-400">{$authError}</p>
            {/if}
            <button
              class="btn preset-tonal-primary w-full text-xs"
              disabled={authLoading || !username || !password}
              onclick={handleAuth}>
              {authLoading ? '…' : 'Registrieren'}
            </button>
          </div>
        </Tabs.Content>
      </Tabs>
      -->
    {/if}
  </section>

  <!-- Animations-Button -->
  <button
    class="btn preset-filled-surface-500 w-full text-xs tracking-widest uppercase
           {mode === 'hamilton' ? 'variant-soft-primary' : 'variant-soft-warning'}"
    onclick={onToggleAnimation}
  >
    {animating ? '⏹ Stop' : '▶ Trajektorie abspielen'}
  </button>

</aside>