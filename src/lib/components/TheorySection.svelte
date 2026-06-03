<script lang="ts">
  import { Collapsible } from '@skeletonlabs/skeleton-svelte';
  import { onMount } from 'svelte';

  // --- TYPES (direkt hier, keine Import-Probleme) ---
  type ColorScheme = "warning" | "primary" | "surface" | "violet" | "orange" | "teal";

  interface FormulaBlock {
    id: string;
    latex: string;
    description?: string;
  }

  interface CollapsibleSection {
    key: string;
    title: string;
    subtitle?: string;
    color: ColorScheme;
    explanation: string;
    formulas: FormulaBlock[];
    comparison?: {
      leftTitle: string;
      rightTitle: string;
      leftContent: FormulaBlock[];
      rightContent: FormulaBlock[];
    };
  }

  // --- DATEN (direkt hier) ---
  const sections: Record<string, CollapsibleSection> = {
    "generalized_el": {
      key: "generalized_el",
      title: "Euler-Lagrange für Felder",
      subtitle: "Beliebig viele unabhängige Variablen",
      color: "violet",
      explanation: `
        Die bisherige Euler-Lagrange-Gleichung behandelt ein System mit einer einzigen unabhängigen Variable – der Zeit.
        Das ist aber kein Sonderfall, sondern das unterste Glied einer Hierarchie:
        Für jede unabhängige Variable, von der das Feld abhängt, liefert das Prinzip der stationären Wirkung genau einen weiteren Term in der EL-Gleichung.
      `,
      formulas: [
        {
          id: "action_point",
          latex: String.raw`$$S[q] = \int L\!\left(q,\,\partial_{\lambda_0} q\right) d\lambda_0$$`,
          description: "Wirkung (Punktmechanik)"
        },
        {
          id: "action_general",
          latex: String.raw`$$S[\varphi] = \int \mathcal{L}\!\left(\varphi,\;\partial_{\lambda_0}\varphi,\;\partial_{\lambda_1}\varphi,\;\ldots,\;\partial_{\lambda_n}\varphi\right) d\lambda_0\,d\lambda_1\cdots d\lambda_n$$`,
          description: "Wirkung (allgemeines Feld)"
        },
        {
          id: "el_general",
          latex: String.raw`$$ \dfrac{\partial\mathcal{L}}{\partial\varphi} - \sum_{i=0}^{n}\dfrac{\partial}{\partial\lambda_i}\!\left(\dfrac{\partial\mathcal{L}}{\partial\varphi_{i}'}\right) = 0 $$`,
          description: "Allgemeine Euler-Lagrange-Gleichung"
        }
      ],
      comparison: {
        leftTitle: "Eine Variable (n=0)",
        rightTitle: "Vier Variablen (n=3)",
        leftContent: [
          {
            id: "case_point",
            latex: String.raw`$$n = 0,\quad \varphi = q(t),\quad \lambda_0 = t$$`,
            description: "Punktmechanik"
          },
          {
            id: "el_point",
            latex: String.raw`$$ \dfrac{\partial L}{\partial q} - \dfrac{d}{dt}\dfrac{\partial L}{\partial \dot{q}} = 0 $$`,
            description: "Gewohnte EL-Gleichung"
          }
        ],
        rightContent: [
          {
            id: "case_4d",
            latex: String.raw`$$n = 3,\quad \varphi = \varphi(t,x,y,z),\quad \lambda_\mu = (t,\vec{r}\,)$$`,
            description: "Relativistisches Feld"
          },
          {
            id: "el_4d",
            latex: String.raw`$$ \dfrac{\partial\mathcal{L}}{\partial\varphi} - \partial_\mu\dfrac{\partial\mathcal{L}}{\partial(\partial_\mu\varphi)} = 0 \quad \text{(Einstein-Summe)} $$`,
            description: "Grundlage der Quantenfeldtheorie"
          }
        ]
      }
    },
    "de_donder_weyl": {
      key: "de_donder_weyl",
      title: "De Donder-Weyl-Formalismus",
      subtitle: "Verallgemeinerter Hamilton",
      color: "primary",
      explanation: `
        Im Punkt-Fall war die Legendre-Transformation ein Variablenwechsel von φ zu genau einem kanonischen Impuls.
        Wenn φ von mehreren Variablen abhängt, hat jede ihre eigene konjugierte Ableitung.
        Die Legendre-Transformation kann man über alle gleichzeitig machen.
      `,
      formulas: [
        {
          id: "poly_momentum",
          latex: String.raw`$$p^{i} := \dfrac{\partial\mathcal{L}}{\partial\varphi_{i}'} \qquad \text{ein Poly-Impuls pro Variable }\lambda_i$$`,
          description: "Poly-Impuls Definition"
        },
        {
          id: "hdw_def",
          latex: String.raw`$$H_{\mathrm{DW}}\!\left(\varphi,\,p^0,\ldots,p^n\right) := \sum_{i=0}^{n} p^{i}\,\varphi_{i}'\!\left(\varphi,p\right) - \mathcal{L}\!\left(\varphi,\varphi_{i}'(\varphi,p)\right)$$`,
          description: "De Donder-Weyl-Hamiltonian"
        },
        {
          id: "ddw_equations",
          latex: String.raw`$$ \dfrac{\partial H_{\mathrm{DW}}}{\partial p^{i}} = \varphi_{i}' \quad\text{und}\quad \sum_{i=0}^{n}\dfrac{\partial}{\partial\lambda_i} p^{i} = -\dfrac{\partial H_{\mathrm{DW}}}{\partial\varphi} $$`,
          description: "De Donder-Weyl-Gleichungen"
        }
      ]
    },
    "lc_schwingkreis": {
      key: "lc_schwingkreis",
      title: "LC-Schwingkreis",
      subtitle: "Elektrischer Oszillator",
      color: "teal",
      explanation: `
        Ein LC-Schwingkreis besteht aus einer Spule (Induktivität L) und einem Kondensator (Kapazität C) in Serie.
        Als verallgemeinerte Koordinate wählt man die Ladung Q.
      `,
      formulas: [
        {
          id: "lc_energy",
          latex: String.raw`$$T = \dfrac{1}{2}L\dot{Q}^{2} \quad \text{(magn. Energie der Spule)}$$`,
          description: "Kinetische Energie"
        },
        {
          id: "lc_potential",
          latex: String.raw`$$V = \dfrac{Q^{2}}{2C} \quad \text{(elektr. Energie des Kondensators)}$$`,
          description: "Potentielle Energie"
        },
        {
          id: "lc_lagrangian",
          latex: String.raw`$$ \mathcal{L} = \dfrac{1}{2}L\dot{Q}^{2} - \dfrac{Q^{2}}{2C} $$`,
          description: "Lagrangian"
        },
        {
          id: "lc_wave",
          latex: String.raw`$$ \ddot{Q} + \omega_{0}^{2} Q = 0 \quad \text{mit} \quad \omega_{0} = \dfrac{1}{\sqrt{LC}} $$`,
          description: "Schwingungsgleichung"
        }
      ]
    }
  };

  // --- MATHJAX LOGIK ---
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

    let debounceTimer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => typeset(), 80);
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-state'],
      subtree: true,
    });
    return () => {
      clearTimeout(debounceTimer);
      observer.disconnect();
    };
  });

  // --- HELPER FÜR TAILWIND KLASSEN ---
  function getColorClasses(color: ColorScheme) {
    const map: Record<ColorScheme, { border: string; bg: string; text: string; hoverBg: string }> = {
      warning: { border: "border-warning-500/20", bg: "bg-warning-500/5", text: "text-warning-400", hoverBg: "hover:bg-warning-500/10" },
      primary: { border: "border-primary-500/20", bg: "bg-primary-500/5", text: "text-primary-400", hoverBg: "hover:bg-primary-500/10" },
      surface: { border: "border-surface-600/30", bg: "bg-surface-800/20", text: "text-surface-400", hoverBg: "hover:bg-surface-800/40" },
      violet:  { border: "border-violet-500/20",  bg: "bg-violet-500/5",  text: "text-violet-400",  hoverBg: "hover:bg-violet-500/10" },
      orange:  { border: "border-orange-500/20",  bg: "bg-orange-500/5",  text: "text-orange-400",  hoverBg: "hover:bg-orange-500/10" },
      teal:    { border: "border-teal-500/20",    bg: "bg-teal-500/5",    text: "text-teal-400",    hoverBg: "hover:bg-teal-500/10" }
    };
    return map[color];
  }

  function getTriggerClasses(color: ColorScheme) {
    const colors = getColorClasses(color);
    return `w-full flex items-center justify-between px-6 py-4 ${colors.bg} ${colors.hoverBg} transition-colors text-left border-b ${colors.border}`;
  }

  function getBadgeClasses(color: ColorScheme) {
    const colors = getColorClasses(color);
    return `px-2 text-xs uppercase tracking-widest ${colors.text}`;
  }
</script>

<section class="max-w-7xl mx-auto px-8 py-12 flex flex-col gap-20">
  {#each Object.values(sections) as section (section.key)}
    <div class="flex flex-col gap-6">
      
      <!-- Section Header -->
      <div class="flex items-center gap-3">
        <span class="text-xs px-2 py-0.5 rounded border tracking-wider uppercase text-surface-400 border-surface-600/30 bg-surface-700/20">Theorie</span>
        <h2 class="text-lg font-light text-surface-200" style="font-family: 'Fraunces', serif;">
          {section.title}
          {#if section.subtitle}
            <span class="text-surface-500 text-sm font-normal ml-2">({section.subtitle})</span>
          {/if}
        </h2>
      </div>

      <!-- Collapsible -->
      <Collapsible class="rounded-xl border overflow-hidden">
        <Collapsible.Trigger class="{getTriggerClasses(section.color)}">
          <div class="flex items-center gap-4 px-2">
            <span class="{getBadgeClasses(section.color)}">
              {section.title.split(' ')[0]}
            </span>
            <span class="text-surface-300 text-sm">Details anzeigen</span>
          </div>
          <svg class="w-4 h-4 px-2 text-surface-400 transition-transform [[data-state=open]_&]:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </Collapsible.Trigger>

        <Collapsible.Content class="border-t border-surface-700/30 bg-surface-900/40">
          <div class="px-6 py-5 grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            <!-- Linke Spalte: Erklärung -->
            <div class="flex flex-col gap-3 text-sm text-surface-400 leading-relaxed">
              <p>{section.explanation}</p>
            </div>

            <!-- Rechte Spalte: Formeln -->
            <div class="flex flex-col gap-4">
              {#each section.formulas as formula (formula.id)}
                <div class="text-surface-300 text-xs bg-surface-900/80 rounded-lg px-4 py-3 border border-surface-700 leading-loose">
                  {@html formula.latex}
                </div>
                {#if formula.description}
                  <p class="text-xs text-surface-500">{formula.description}</p>
                {/if}
              {/each}
            </div>

          </div>

          <!-- Vergleichs-Layout (optional) -->
          {#if section.comparison}
            <div class="px-6 py-5 border-t border-surface-700/30">
              <p class="text-xs uppercase tracking-widest text-surface-400 mb-4">Spezialfälle</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <!-- Linke Spalte -->
                <div class="rounded-xl border border-surface-600/30 bg-surface-800/20 p-5 flex flex-col gap-3">
                  <p class="text-xs uppercase tracking-widest text-surface-400">{section.comparison.leftTitle}</p>
                  {#each section.comparison.leftContent as formula (formula.id)}
                    <div class="text-surface-300 text-xs bg-surface-900/80 rounded-lg px-3 py-2 border border-surface-700 leading-loose">
                      {@html formula.latex}
                    </div>
                    {#if formula.description}
                      <p class="text-xs text-surface-500">{formula.description}</p>
                    {/if}
                  {/each}
                </div>

                <!-- Rechte Spalte -->
                <div class="rounded-xl border border-surface-600/30 bg-surface-800/20 p-5 flex flex-col gap-3">
                  <p class="text-xs uppercase tracking-widest text-surface-400">{section.comparison.rightTitle}</p>
                  {#each section.comparison.rightContent as formula (formula.id)}
                    <div class="text-surface-300 text-xs bg-surface-900/80 rounded-lg px-3 py-2 border border-surface-700 leading-loose">
                      {@html formula.latex}
                    </div>
                    {#if formula.description}
                      <p class="text-xs text-surface-500">{formula.description}</p>
                    {/if}
                  {/each}
                </div>

              </div>
            </div>
          {/if}

        </Collapsible.Content>
      </Collapsible>

    </div>
  {/each}
</section>