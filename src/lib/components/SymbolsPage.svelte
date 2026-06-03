<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  const nav = [
    { href: '/',         label: 'Simulation' },
    { href: '/symbole',  label: 'Symbole'    },
    { href: '/theorie',  label: 'Theorie'    },
  ];

  async function typeset() {
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
  }

  onMount(() => {
    typeset();
  });

  // ── Tabellen ───────────────────────────────────────────────────────────────
  const lagrangeRows = [
    { sym: String.raw`\(x\)`,          name: 'Position',          unit: String.raw`\(\mathrm{m}\)`,          desc: 'Auslenkung aus der Ruhelage' },
    { sym: String.raw`\(\dot{x}\)`,    name: 'Geschwindigkeit',   unit: String.raw`\(\mathrm{m/s}\)`,        desc: 'Zeitliche Ableitung der Position' },
    { sym: String.raw`\(\ddot{x}\)`,   name: 'Beschleunigung',    unit: String.raw`\(\mathrm{m/s^{2}}\)`,      desc: 'Zweite Ableitung nach der Zeit' },
    { sym: String.raw`\(m\)`,          name: 'Masse',             unit: String.raw`\(\mathrm{kg}\)`,          desc: 'Träge Masse des Oszillators' },
    { sym: String.raw`\(k\)`,          name: 'Federkonstante',    unit: String.raw`\(\mathrm{N/m}\)`,         desc: 'Rückstellkraft pro Auslenkung' },
    { sym: String.raw`\(\gamma\)`,     name: 'Dämpfungskoeff.',   unit: String.raw`\(\mathrm{kg/s}\)`,        desc: 'Stärke der Reibungskraft' },
    { sym: String.raw`\(T\)`,          name: 'Kin. Energie',      unit: String.raw`\(\mathrm{J}\)`,           desc: String.raw`\(T = \dfrac{1}{2}m\dot{x}^{2}\)` },
    { sym: String.raw`\(V\)`,          name: 'Pot. Energie',      unit: String.raw`\(\mathrm{J}\)`,           desc: String.raw`\(V = \dfrac{1}{2}kx^{2}\)` },
    { sym: String.raw`\(L\)`,          name: 'Lagrange-Funktion', unit: String.raw`\(\mathrm{J}\)`,           desc: String.raw`\(L = T - V\)` },
    { sym: String.raw`\(\omega_{0}\)`,   name: 'Eigenfrequenz',     unit: String.raw`\(\mathrm{rad/s}\)`,       desc: String.raw`\(\omega_{0} = \sqrt{k/m}\)` },
    { sym: String.raw`\(x_{0}\)`,        name: 'Anfangsposition',   unit: String.raw`\(\mathrm{m}\)`,           desc: String.raw`Position bei \(t = 0\)` },
  ];

  const hamiltonRows = [
    { sym: String.raw`\(q\)`,          name: 'Generalkoordinate',  unit: String.raw`\(\mathrm{m}\)`,             desc: String.raw`Kanonische Ortskoordinate (hier: \(x\))` },
    { sym: String.raw`\(p\)`,          name: 'Kan. Impuls',        unit: String.raw`\(\mathrm{kg\cdot m/s}\)`,   desc: String.raw`\(p = m\dot{x}\) – konjugiert zu \(q\)` },
    { sym: String.raw`\(H\)`,          name: 'Hamilton-Funktion',  unit: String.raw`\(\mathrm{J}\)`,             desc: String.raw`\(H = \dfrac{p^{2}}{2m} + \dfrac{1}{2}kq^{2}\)` },
    { sym: String.raw`\(\dot{p}\)`,    name: 'Impulsänderung',     unit: String.raw`\(\mathrm{N}\)`,             desc: String.raw`\(\dot{p} = -\partial H/\partial q = -kq\)` },
    { sym: String.raw`\(\dot{q}\)`,    name: 'Koordinatenänderg.', unit: String.raw`\(\mathrm{m/s}\)`,           desc: String.raw`\(\dot{q} = \partial H/\partial p = p/m\)` },
    { sym: String.raw`\(T\)`,          name: 'Kin. Energie',       unit: String.raw`\(\mathrm{J}\)`,             desc: String.raw`\(T = p^{2}/(2m)\)` },
    { sym: String.raw`\(V\)`,          name: 'Pot. Energie',       unit: String.raw`\(\mathrm{J}\)`,             desc: String.raw`\(V = \dfrac{1}{2}kq^{2}\)` },
    { sym: String.raw`\(E\)`,          name: 'Gesamtenergie',      unit: String.raw`\(\mathrm{J}\)`,             desc: String.raw`\(E = H(q,p)\) – Erhaltungsgröße` },
    { sym: String.raw`\(\omega_{0}\)`,   name: 'Eigenfrequenz',      unit: String.raw`\(\mathrm{rad/s}\)`,         desc: String.raw`\(\omega_{0} = \sqrt{k/m}\)` },
    { sym: String.raw`\(p_{0}\)`,        name: 'Anfangsimpuls',      unit: String.raw`\(\mathrm{kg\cdot m/s}\)`,   desc: String.raw`Impuls bei \(t = 0\)` },
  ];

  const phaseRows = [
    { sym: String.raw`\(a\)`, name: 'Große Halbachse',  unit: String.raw`\(\mathrm{m}\)`,            desc: String.raw`\(a = \sqrt{2E/k}\)` + ' – max. Auslenkung' },
    { sym: String.raw`\(b\)`, name: 'Kleine Halbachse', unit: String.raw`\(\mathrm{kg\cdot m/s}\)`,  desc: String.raw`\(b = \sqrt{2mE}\)` + ' – max. Impuls' },
    { sym: String.raw`\(A\)`, name: 'Ellipsenfläche',   unit: String.raw`\(\mathrm{J\cdot s}\)`,     desc: String.raw`\(A = \pi a b = \dfrac{2\pi E}{\omega_{0}}\)` },
    { sym: String.raw`\(E\)`, name: 'Energie',          unit: String.raw`\(\mathrm{J}\)`,            desc: String.raw`\(E = \dfrac{1}{2}kx_{0}^{2} + \dfrac{p_{0}^{2}}{2m}\)` },
  ];

  // ── Block-Formeln ──────────────────────────────────────────────────────────
  const eulerDisplay  = String.raw`\(\dfrac{d}{dt}\!\left(\dfrac{\partial L}{\partial \dot{x}}\right) - \dfrac{\partial L}{\partial x} = 0\)`;
  const eulerSteps    = [
    String.raw`\(\dfrac{\partial L}{\partial \dot{x}} = m\dot{x} \;\Rightarrow\; \dfrac{d}{dt}(m\dot{x}) = m\ddot{x}\)`,
    String.raw`\(\dfrac{\partial L}{\partial x} = -kx\)`,
    String.raw`\(m\ddot{x} + kx = 0\)`,
  ].join('<br>');

  const hamDisplay    = String.raw`\(\dot{q} = \dfrac{\partial H}{\partial p} \qquad \dot{p} = -\dfrac{\partial H}{\partial q}\)`;
  const hamSteps      = [
    String.raw`\(\dot{q} = \dfrac{\partial H}{\partial p} = \dfrac{p}{m} \quad \text{(Geschwindigkeit)}\)`,
    String.raw`\(\dot{p} = -\dfrac{\partial H}{\partial q} = -kq \quad \text{(Rückstellkraft)}\)`,
    String.raw`\(\Rightarrow\; m\ddot{q} + kq = 0\)`,
  ].join('<br>');

  const phaseFormulas = [
    String.raw`\(a = \sqrt{2E/k}\;[\mathrm{m}]\)`,
    String.raw`\(b = \sqrt{2mE}\;[\mathrm{kg\cdot m/s}]\)`,
    String.raw`\(A = \pi ab = \dfrac{2\pi E}{\omega_{0}}\;[\mathrm{J\cdot s}]\)`,
  ].join('<br>');

  // ── Inline-Formeln ─────────────────────────────────────────────────────────
  const fi = {
    S:       String.raw`\(S = \int L\, dt\)`,
    dLdxdot: String.raw`\(\partial L/\partial \dot{x}\)`,
    dLdx:    String.raw`\(\partial L/\partial x\)`,
    mdotx:   String.raw`\(m\dot{x}\)`,
    mkx:     String.raw`\(-kx\)`,
    Ldef:    String.raw`\(L = \dfrac{1}{2}m\dot{x}^{2} - \dfrac{1}{2}kx^{2}\)`,
    Hdef:    String.raw`\(H = \dfrac{p^{2}}{2m} + \dfrac{1}{2}kq^{2}\)`,
    qp:      String.raw`\((q, p)\)`,
    H:       String.raw`\(H\)`,
    Econst:  String.raw`\(E = \dfrac{p^{2}}{2m} + \dfrac{1}{2}kq^{2} = \mathrm{const}\)`,
    asqrt:   String.raw`\(a = \sqrt{2E/k}\)`,
    bsqrt:   String.raw`\(b = \sqrt{2mE}\)`,
  };
</script>

  <!-- WIP Banner 
  <div class="flex items-center gap-3 px-8 py-2.5 bg-warning-800 border-b border-warning-500/20 text-warning-300 text-xs">
    <span class="shrink-0">⚠</span>
    <p>Diese Seite befindet sich im Aufbau – Inhalte können unvollständig oder fehlerhaft sein.</p>
  </div>-->

<div class="min-h-screen bg-surface-950 text-surface-50" style="font-family: 'DM Mono', monospace;">

  <header class="flex items-baseline gap-4 px-8 py-5 border-b border-surface-700 bg-surface-950/80 backdrop-blur-md sticky top-0 z-20">
    <h1 class="text-2xl font-light tracking-tight" style="font-family: 'Fraunces', serif;">
      Phasen<em class="not-italic text-surface-400">diagramm</em>
    </h1>
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

  <main class="max-w-7xl mx-auto px-8 py-12 flex flex-col gap-20">

    <!-- ── Lagrange ─────────────────────────────────────────────────────── -->
    <section>
      <div class="flex items-center gap-3 mb-8">
        <span class="text-[0.6rem] px-2 py-0.5 rounded border tracking-wider uppercase text-warning-500 border-warning-500/30 bg-warning-500/10">Lagrange</span>
        <h2 class="text-lg font-light text-surface-200" style="font-family: 'Fraunces', serif;">Lagrange-Formalismus</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        <div>
          <p class="text-[0.6rem] uppercase tracking-widest text-surface-500 mb-4">Symbole</p>
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-2 pr-4 text-[0.6rem] uppercase tracking-widest text-surface-500 font-normal w-12">Sym.</th>
                <th class="text-left py-2 pr-4 text-[0.6rem] uppercase tracking-widest text-surface-500 font-normal w-32">Name</th>
                <th class="text-left py-2 text-[0.6rem] uppercase tracking-widest text-surface-500 font-normal">Beschreibung</th>
              </tr>
            </thead>
            <tbody>
              {#each lagrangeRows as row}
                <tr class="border-b border-surface-800 hover:bg-surface-900/40 transition-colors">
                  <td class="py-2 pr-4 text-warning-400">{@html row.sym}</td>
                  <td class="py-2 pr-4 text-surface-300 text-xs">{row.name}</td>
                  <td class="py-2 text-surface-500 text-xs">
                    {@html row.desc}<span class="ml-1 text-surface-600">[{@html row.unit}]</span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="rounded-xl border border-warning-500/20 bg-warning-500/5 p-6 flex flex-col gap-4">
          <p class="text-[0.6rem] uppercase tracking-widest text-warning-500">Schlüsselgleichung · Euler-Lagrange</p>
          <div class="text-warning-300 text-center">{@html eulerDisplay}</div>
          <div class="flex flex-col gap-3 text-sm text-surface-400 leading-relaxed">
            <p>
              Diese Gleichung ist das Herzstück des Lagrange-Formalismus. Sie folgt aus dem
              <span class="text-surface-300">Prinzip der kleinsten Wirkung</span>: Ein physikalisches System
              bewegt sich auf dem Weg, für den das Integral
              <span class="text-warning-400">{@html fi.S}</span> (die Wirkung) extremal wird.
            </p>
            <p>
              Der Term <span class="text-warning-400">{@html fi.dLdxdot}</span> ist der verallgemeinerte Impuls
              (hier: {@html fi.mdotx}), und <span class="text-warning-400">{@html fi.dLdx}</span> die
              verallgemeinerte Kraft (hier: {@html fi.mkx}).
            </p>
            <p>Für <span class="text-warning-400">{@html fi.Ldef}</span>:</p>
            <div class="text-warning-300 text-xs bg-surface-900/80 rounded-lg px-4 py-3 border border-surface-700 leading-loose">
              {@html eulerSteps}
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ── Hamilton ─────────────────────────────────────────────────────── -->
    <section>
      <div class="flex items-center gap-3 mb-8">
        <span class="text-[0.6rem] px-2 py-0.5 rounded border tracking-wider uppercase text-primary-500 border-primary-500/30 bg-primary-500/10">Hamilton</span>
        <h2 class="text-lg font-light text-surface-200" style="font-family: 'Fraunces', serif;">Hamilton-Formalismus</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        <div>
          <p class="text-[0.6rem] uppercase tracking-widest text-surface-500 mb-4">Symbole</p>
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-2 pr-4 text-[0.6rem] uppercase tracking-widest text-surface-500 font-normal w-12">Sym.</th>
                <th class="text-left py-2 pr-4 text-[0.6rem] uppercase tracking-widest text-surface-500 font-normal w-32">Name</th>
                <th class="text-left py-2 text-[0.6rem] uppercase tracking-widest text-surface-500 font-normal">Beschreibung</th>
              </tr>
            </thead>
            <tbody>
              {#each hamiltonRows as row}
                <tr class="border-b border-surface-800 hover:bg-surface-900/40 transition-colors">
                  <td class="py-2 pr-4 text-primary-400">{@html row.sym}</td>
                  <td class="py-2 pr-4 text-surface-300 text-xs">{row.name}</td>
                  <td class="py-2 text-surface-500 text-xs">
                    {@html row.desc}<span class="ml-1 text-surface-600">[{@html row.unit}]</span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="rounded-xl border border-primary-500/20 bg-primary-500/5 p-6 flex flex-col gap-4">
          <p class="text-[0.6rem] uppercase tracking-widest text-primary-500">Schlüsselgleichungen · Hamilton</p>
          <div class="text-primary-300 text-center">{@html hamDisplay}</div>
          <div class="flex flex-col gap-3 text-sm text-surface-400 leading-relaxed">
            <p>
              Statt einer Gleichung zweiter Ordnung erhält man
              <span class="text-surface-300">zwei Gleichungen erster Ordnung</span> – symmetrisch
              in Ort und Impuls. Das ist der Grund warum der Phasenraum mit den Achsen
              <span class="text-primary-400">{@html fi.qp}</span> so natürlich für diesen Formalismus ist.
            </p>
            <p>Für <span class="text-primary-400">{@html fi.Hdef}</span>:</p>
            <div class="text-primary-300 text-xs bg-surface-900/80 rounded-lg px-4 py-3 border border-surface-700 leading-loose">
              {@html hamSteps}
            </div>
            <p>
              {@html fi.H} ist eine <span class="text-surface-300">Erhaltungsgröße</span>: Im Phasenraum
              bewegt sich der Punkt {@html fi.qp} auf einer <span class="text-surface-300">geschlossenen Ellipse</span>.
              Bei Dämpfung spiralisiert er zum Ursprung.
            </p>
          </div>
        </div>

      </div>
    </section>

    <!-- ── Phasenraum ────────────────────────────────────────────────────── -->
    <section>
      <div class="flex items-center gap-3 mb-8">
        <span class="text-[0.6rem] px-2 py-0.5 rounded border tracking-wider uppercase text-surface-400 border-surface-600/30 bg-surface-700/20">Phasenraum</span>
        <h2 class="text-lg font-light text-surface-200" style="font-family: 'Fraunces', serif;">Phasenraum-Geometrie</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        <div>
          <p class="text-[0.6rem] uppercase tracking-widest text-surface-500 mb-4">Symbole</p>
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="border-b border-surface-700">
                <th class="text-left py-2 pr-4 text-[0.6rem] uppercase tracking-widest text-surface-500 font-normal w-12">Sym.</th>
                <th class="text-left py-2 pr-4 text-[0.6rem] uppercase tracking-widest text-surface-500 font-normal w-32">Name</th>
                <th class="text-left py-2 text-[0.6rem] uppercase tracking-widest text-surface-500 font-normal">Beschreibung</th>
              </tr>
            </thead>
            <tbody>
              {#each phaseRows as row}
                <tr class="border-b border-surface-800 hover:bg-surface-900/40 transition-colors">
                  <td class="py-2 pr-4 text-surface-300">{@html row.sym}</td>
                  <td class="py-2 pr-4 text-surface-300 text-xs">{row.name}</td>
                  <td class="py-2 text-surface-500 text-xs">
                    {@html row.desc}<span class="ml-1 text-surface-600">[{@html row.unit}]</span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="rounded-xl border border-surface-600/30 bg-surface-800/20 p-6 flex flex-col gap-4">
          <p class="text-[0.6rem] uppercase tracking-widest text-surface-400">Warum Ellipsen?</p>
          <div class="flex flex-col gap-3 text-sm text-surface-400 leading-relaxed">
            <p>
              Die Ellipsenform folgt direkt aus der Energieerhaltung. Da
              {@html fi.Econst}
              ist das eine Ellipsengleichung im {@html fi.qp}-Raum mit den Halbachsen
              <span class="text-surface-300">{@html fi.asqrt}</span> und
              <span class="text-surface-300">{@html fi.bsqrt}</span>.
            </p>
            <p>
              Jede Energiestufe entspricht einer eigenen Ellipse. Trajektorien verschiedener Energien
              <span class="text-surface-300">schneiden sich niemals</span> – das ist der
              <span class="text-surface-300">Satz von Liouville</span>: Das Phasenraumvolumen
              bleibt unter hamiltonischer Zeitentwicklung erhalten.
            </p>
            <div class="text-surface-300 text-xs bg-surface-900/80 rounded-lg px-4 py-3 border border-surface-700 leading-loose">
              {@html phaseFormulas}
            </div>
          </div>
        </div>

      </div>
    </section>

  </main>

</div>