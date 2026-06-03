<script lang="ts">
  import { page } from '$app/stores';
  import { Collapsible } from '@skeletonlabs/skeleton-svelte';
  import { onMount } from 'svelte';

  // --- NAVIGATION ---
  const nav = [
    { href: '/',        label: 'Simulation' },
    { href: '/symbole', label: 'Symbole'    },
    { href: '/theorie', label: 'Theorie'    },
  ];

  // --- TYPES ---
  type ColorScheme = "warning" | "primary" | "surface" | "violet" | "orange" | "teal";

  interface SubSection {
    title: string;
    explanation: string;
    formulas: Array<{ id: string; latex: string; description?: string }>;
    comparison?: {
      leftTitle: string;
      rightTitle: string;
      leftContent: Array<{ id: string; latex: string; description?: string }>;
      rightContent: Array<{ id: string; latex: string; description?: string }>;
    };
    twoColumn?: {
      leftTitle: string;
      rightTitle: string;
      leftContent: string;
      rightContent: string;
    };
  }

  interface CollapsibleTheme {
    key: string;
    title: string;
    color: ColorScheme;
    subSections: SubSection[];
  }

  // --- DATENSTRUKTUR (ORIGINALER TEXT, NUR STRUKTURIERT) ---
  const themes: Record<string, CollapsibleTheme> = {
    "surface": {
      key: "surface",
      title: "Grundlagen & Vergleich",
      color: "surface",
      subSections: [
        {
          title: "Newton, Lagrange & Hamilton – drei Wege, ein Gesetz",
          explanation: `
            Alle drei Formalismen beschreiben exakt dieselbe Physik und liefern identische Bewegungsgleichungen.
            Der Unterschied liegt nicht in der Physik, sondern in der mathematischen Sprache –
            und damit darin, welche Strukturen sichtbar werden.
            
            Newton lässt sich grundsätzlich in beliebige Koordinaten transformieren, aber jeder Koordinatenwechsel
            erzeugt explizite Scheinkräfte, und Zwangsbedingungen erfordern immer Zusatzterme.
            Lagrange und Hamilton umgehen das, weil sie auf Energien statt Kräften beruhen –
            die Wahl der Koordinaten beeinflusst die Struktur der Gleichungen nicht mehr.
          `,
          formulas: [],
          twoColumn: {
            leftTitle: "Vergleich der Formalismen",
            rightTitle: "Historische Entwicklung",
            leftContent: `
              <div class="space-y-3">
                <div class="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                  <p class="text-xs text-orange-400 mb-1">Newton · Principia · 1687</p>
                  <p class="text-xs text-surface-500 leading-relaxed">
                    ➕ Direkte physikalische Intuition<br/>
                    ➕ Koordinatentransformationen möglich<br/>
                    ➖ Transformation erzeugt Scheinkräfte explizit<br/>
                    ➖ Zwangskräfte immer separat berechnen
                  </p>
                </div>
                <div class="p-3 bg-warning-500/5 border border-warning-500/20 rounded-lg">
                  <p class="text-xs text-warning-400 mb-1">Lagrange · Mécanique analytique · 1788</p>
                  <p class="text-xs text-surface-500 leading-relaxed">
                    ➕ Koordinaten frei wählbar – keine Scheinkräfte<br/>
                    ➕ Zwangsbedingungen automatisch erfüllt<br/>
                    ➖ Eine Gleichung 2. Ordnung pro Freiheitsgrad
                  </p>
                </div>
                <div class="p-3 bg-primary-500/5 border border-primary-500/20 rounded-lg">
                  <p class="text-xs text-primary-400 mb-1">Hamilton · On a General Method · 1835</p>
                  <p class="text-xs text-surface-500 leading-relaxed">
                    ➕ Symmetrie zwischen Ort und Impuls explizit<br/>
                    ➕ Erhaltungsgrößen, Liouville, Poincaré<br/>
                    ➕ Direkter Weg zur Quantenmechanik
                  </p>
                </div>
              </div>
            `,
            rightContent: `
              <div class="space-y-2 text-xs text-surface-500 leading-relaxed">
                <p><strong>Principia Mathematica</strong> – Newtons Werk legte den Grundstein für die klassische Mechanik.</p>
                <p><strong>Mécanique analytique</strong> – Lagrange formulierte die Mechanik rein analytisch ohne geometrische Konstruktionen.</p>
                <p><strong>On a General Method</strong> – Hamilton entwickelte den Phasenraum-Formalismus.</p>
              </div>
            `
          }
        },
        {
          title: "Partielle vs. totale Ableitung",
          explanation: `
            Partielle Ableitung (∂): Gibt an wie sich f ändert wenn nur x variiert – alle anderen Variablen gelten als konstant.
            
            Totale Ableitung (d/dt): Berücksichtigt, dass sich alle Variablen gleichzeitig mit der Zeit ändern. Per Kettenregel.
            
            Warum der Unterschied entscheidend ist:
            - ∂L/∂x liefert die verallgemeinerte Kraft – wie stark das Potential x zurückzieht, ohne die Geschwindigkeit zu berücksichtigen.
            - ∂L/∂ẋ liefert den verallgemeinerten Impuls – bei L = ½mẋ² - V ist das schlicht mẋ.
            - Erst die totale Zeitableitung ergibt mẍ. Euler-Lagrange setzt das gleich: Impulsänderung = Kraft.
          `,
          formulas: [
            { id: "partial_formulas", latex: String.raw`$$ \dfrac{\partial L}{\partial x} = -kx \quad \text{und} \quad \dfrac{\partial L}{\partial \dot{x}} = m\dot{x} $$`, description: "Partielle Ableitungen" },
            { id: "total_formulas", latex: String.raw`$$ \dfrac{df}{dt} = \dfrac{\partial f}{\partial x}\dot{x} + \dfrac{\partial f}{\partial \dot{x}}\ddot{x} + \dfrac{\partial f}{\partial t} $$`, description: "Totale Ableitung" },
            { id: "el_step", latex: String.raw`$$ \dfrac{d}{dt}\!\left(\dfrac{\partial L}{\partial \dot{x}}\right) = \dfrac{d}{dt}(m\dot{x}) = m\ddot{x} $$`, description: "Totale Zeitableitung" }
          ]
        },
        {
          title: "Phasenraum",
          explanation: `
            Die Ellipsenform folgt direkt aus der Energieerhaltung: E = const ist eine Ellipsengleichung im (q,p)-Raum mit Halbachsen a und b.
            
            Trajektorien verschiedener Energien schneiden sich niemals – Satz von Liouville: Das Phasenraumvolumen bleibt unter hamiltonischer Zeitentwicklung erhalten.
          `,
          formulas: [
            { id: "phase_energy", latex: String.raw`$$E = \dfrac{p^{2}}{2m} + \dfrac{1}{2}kq^{2} = \mathrm{const}$$`, description: "Energieerhaltung" },
            { id: "phase_axes", latex: String.raw`$$a = \sqrt{2E/k}\;[\mathrm{m}] \quad b = \sqrt{2mE}\;[\mathrm{kg\cdot m/s}]$$`, description: "Halbachsen" },
            { id: "phase_area", latex: String.raw`$$A = \pi ab = \dfrac{2\pi E}{\omega_{0}}\;[\mathrm{J\cdot s}]$$`, description: "Fläche im Phasenraum" }
          ]
        },
        {
          title: "Verallgemeinerte Größen & Einheiten",
          explanation: `
            Die verallgemeinerten Koordinaten, Impulse und Kräfte tragen nicht zwingend die gewohnten SI-Einheiten.
            Das Produkt p · q̇ muss immer [J] ergeben – aber p und q̇ einzeln können beliebige Einheiten tragen.
          `,
          formulas: [],
          twoColumn: {
            leftTitle: "Mechanisch",
            rightTitle: "Elektrisch",
            leftContent: `
              <div class="space-y-2 text-xs">
                <p><span class="text-surface-300">x → [m]</span></p>
                <p><span class="text-surface-300">m → [kg]</span></p>
                <p><span class="text-surface-300">k → [N/m]</span></p>
                <p><span class="text-surface-300">mẋ → [kg·m/s]</span></p>
                <p><span class="text-surface-300">ω₀ = √(k/m)</span></p>
                <p class="text-surface-500 mt-2">p ist Impuls, Kraft ist Kraft.</p>
              </div>
            `,
            rightContent: `
              <div class="space-y-2 text-xs">
                <p><span class="text-surface-300">Q → [C]</span></p>
                <p><span class="text-surface-300">L → [H]</span> Henry (H) – SI-Einheit der Induktivität; 1 H = 1 kg·m²·A⁻²·s⁻²</p>
                <p><span class="text-surface-300">1/C → [F⁻¹]</span> Farad (F) – SI-Einheit der Kapazität; 1 F = 1 C/V = 1 A²·s⁴·kg⁻¹·m⁻²</p>
                <p><span class="text-surface-300">LQ̇ → [Wb]</span> Weber (Wb) – SI-Einheit des magn. Flusses; 1 Wb = 1 V·s = 1 kg·m²·A⁻¹·s⁻²</p>
                <p><span class="text-surface-300">ω₀ = 1/√(LC)</span></p>
                <p class="text-surface-500 mt-2">p ist magnetischer Fluss, Kraft ist Spannung.</p>
              </div>
            `
          }
        }
      ]
    },

    "warning": {
      key: "warning",
      title: "Wirkungsprinzip & Variationsrechnung",
      color: "warning",
      subSections: [
        {
          title: "Das Wirkungsprinzip",
          explanation: `
            S ist ein Funktional – es nimmt eine ganze Trajektorie q(t) als Eingabe und gibt eine einzige reelle Zahl aus. Nicht ein Punkt im Raum, sondern ein ganzer Weg wird bewertet.
            
            Das Hamiltonsche Prinzip besagt: Das physikalisch realisierte System wählt unter allen Wegen von t₁ nach t₂ genau jenen, für den S stationär ist – also δS = 0. Stationär bedeutet weder Maximum noch Minimum sein muss, sondern einen Sattelpunkt im Funktionenraum.
          `,
          formulas: [
            { id: "wirkung_def", latex: String.raw`$$S[q] = \int_{t_1}^{t_2} L\!\left(q(t),\,\dot{q}(t),\,t\right) dt$$`, description: "Wirkung" },
            { id: "variation", latex: String.raw`$$ \delta S = \int_{t_1}^{t_2} \left(\dfrac{\partial L}{\partial q}\,\delta q + \dfrac{\partial L}{\partial \dot{q}}\,\delta \dot{q}\right) dt $$`, description: "Variation der Wirkung" },
            { id: "randbedingung", latex: String.raw`$$ \delta q(t_1) = \delta q(t_2) = 0 \quad \text{(Randbedingungen)} $$`, description: "Randbedingungen" }
          ]
        },
        {
          title: "Kommutativität δ und d/dt",
          explanation: `
            Das ist keine Definition, sondern eine Konsequenz daraus, dass ε nicht von t abhängt.
            δ differenziert nach ε, d/dt differenziert nach t – da die beiden Variablen unabhängig sind, vertauschen die Operatoren, genau wie gemischte partielle Ableitungen bei glatten Funktionen.
            
            Formal zeigt man es durch explizites Ausrechnen beider Seiten: Beide ergeben η̇(t) – die Zeitableitung der Deformationsfunktion.
          `,
          formulas: [
            { id: "q_eps", latex: String.raw`$$q_\varepsilon(t) := q(t) + \varepsilon\,\eta(t),\quad \eta(t_1)=\eta(t_2)=0$$`, description: "Deformation der Trajektorie" },
            { id: "delta_q", latex: String.raw`$$ \delta q := \dfrac{d}{d\varepsilon}\bigg|_{\varepsilon=0} q_\varepsilon = \eta(t) $$`, description: "Definition der Variation" },
            { id: "kommu_proof", latex: String.raw`$$ \delta\dot{q} = \dfrac{d}{dt}(\delta q) \quad \checkmark $$`, description: "Kommutativität bewiesen" }
          ]
        },
        {
          title: "Partielle Integration",
          explanation: `
            Da δq̇ = d/dt(δq) gilt, schreibt man den Term um. Per Produktregel zerlegt man den Term in eine totale Ableitung (die als Randterm herausfällt) und den gewünschten Term mit δq.
            
            Der Randterm [∂L/∂q̇ · δq] von t₁ bis t₂ verschwindet, weil δq(t₁) = δq(t₂) = 0 per Konstruktion der Variation gilt. Übrig bleibt ein einziges Integral, in dem δq überall der freie Faktor ist.
          `,
          formulas: [
            { id: "produktregel", latex: String.raw`$$ \dfrac{\partial L}{\partial \dot{q}}\,\delta\dot{q} = \dfrac{d}{dt}\!\left(\dfrac{\partial L}{\partial \dot{q}}\,\delta q\right) - \dfrac{d}{dt}\!\left(\dfrac{\partial L}{\partial \dot{q}}\right)\delta q $$`, description: "Produktregel" },
            { id: "randterm", latex: String.raw`$$ \left[\dfrac{\partial L}{\partial \dot{q}}\,\delta q\right]_{t_1}^{t_2} = 0 \quad \text{(Randbed.)} $$`, description: "Randterm verschwindet" }
          ]
        },
        {
          title: "Fundamentalsatz der Variationsrechnung",
          explanation: `
            Diese Gleichung muss für alle zulässigen δq gelten. Der Beweis geht per Widerspruch: Angenommen F(t₀) ≠ 0 an einer Stelle, dann ist F ≠ 0 auf ganzem Intervall [t₀-ε, t₀+ε] wegen Stetigkeit.
            
            Wähle δq konzentriert auf [t₀-ε, t₀+ε], sgn(δq) = sgn(F) ⇒ ∫ F·δq dt > 0 — Widerspruch! ⇒ F(t) = 0 ∀t
          `,
          formulas: [
            { id: "fund_result", latex: String.raw`$$ \delta S = \int_{t_1}^{t_2}\left(\dfrac{\partial L}{\partial q} - \dfrac{d}{dt}\dfrac{\partial L}{\partial \dot{q}}\right)\delta q\; dt = 0 $$`, description: "Nach partieller Integration" },
            { id: "el_gleichung", latex: String.raw`$$ \dfrac{d}{dt}\!\left(\dfrac{\partial L}{\partial \dot{q}}\right) - \dfrac{\partial L}{\partial q} = 0 $$`, description: "Euler-Lagrange-Gleichung" }
          ]
        }
      ]
    },

    "orange": {
      key: "orange",
      title: "Newton-Äquivalenz & Potentiale",
      color: "orange",
      subSections: [
        {
          title: "Äquivalenz zu Newton",
          explanation: `
            Dies gilt genau dann, wenn V = V(q,t) – das Potential hängt nicht von q̇ ab. Dann ist ∂L/∂q gleich -∂V/∂q und Euler-Lagrange reduziert sich auf Newtons zweites Axiom.
          `,
          formulas: [
            { id: "lagrangian_newton", latex: String.raw`$$L = \dfrac{1}{2}m\dot{q}^{2} - V(q,t)$$`, description: "Lagrangian" },
            { id: "partial_l_qdot", latex: String.raw`$$ \dfrac{\partial L}{\partial \dot{q}} = m\dot{q},\quad \dfrac{d}{dt}(m\dot{q}) = m\ddot{q} $$`, description: "Impuls und seine Ableitung" },
            { id: "partial_l_q", latex: String.raw`$$ \dfrac{\partial L}{\partial q} = -\dfrac{\partial V}{\partial q} = F(q,t) $$`, description: "Kraft aus Potential" },
            { id: "newton_result", latex: String.raw`$$ m\ddot{q} = F \quad \checkmark $$`, description: "Newtons zweites Gesetz" }
          ]
        },
        {
          title: "Was wenn V = V(q, q̇, t)?",
          explanation: `
            Hängt das Potential auch von der Geschwindigkeit ab – wie beim Lorentz-Potential in der Elektrodynamik – ist Euler-Lagrange weiterhin exakt gültig. Aber die verallgemeinerte Kraft ∂L/∂q enthält dann auch Terme aus d/dt(∂L/∂q̇), und der Vergleich mit Newton erfordert mehr Sorgfalt. Der Lagrange-Formalismus ist dort der mächtigere Rahmen.
          `,
          formulas: [
            { id: "v_qdot_case", latex: String.raw`$$ V = V(q,\dot{q},t) \;\Rightarrow\; \dfrac{\partial L}{\partial q}\neq -\dfrac{\partial V}{\partial q} $$`, description: "Allgemeiner Fall" },
            { id: "lorentz_potential", latex: String.raw`$$ V = q_e(\phi - \dot{\vec{r}}\cdot\vec{A}) $$`, description: "Beispiel: Lorentz-Potential" }
          ]
        }
      ]
    },

    "primary": {
      key: "primary",
      title: "Legendre-Transformation & Hamilton",
      color: "primary",
      subSections: [
        {
          title: "Allgemeine Definition",
          explanation: `
            Die Legendre-Transformation ersetzt die unabhängige Variable x durch ihre konjugierte Variable p – die Steigung. Man beschreibt die Funktion nicht mehr durch ihre Werte, sondern durch ihre Tangentenschar: g(p) ist der negative y-Achsenabschnitt der Tangente mit Steigung p.
          `,
          formulas: [
            { id: "legendre_def", latex: String.raw`$$f : \mathbb{R} \to \mathbb{R},\quad f'' > 0 \;\text{(streng konvex)}$$`, description: "Konvexitätsbedingung" },
            { id: "conjugate_var", latex: String.raw`$$p := f'(x) \quad\text{(konjugierte Variable — Steigung)}$$`, description: "Konjugierte Variable" },
            { id: "legendre_transform", latex: String.raw`$$g(p) := \sup_{x}\bigl(p\cdot x - f(x)\bigr) = p\cdot x^*(p) - f(x^*(p))$$`, description: "Legendre-Transformierte" }
          ]
        },
        {
          title: "Bijektivität – warum und wozu",
          explanation: `
            Ohne f'' > 0 könnte dieselbe Steigung p bei verschiedenen x-Werten auftreten – der Wechsel der Variablen wäre dann nicht eindeutig. In der Mechanik heißt das konkret: Man muss q̇ᵢ aus pᵢ = ∂L/∂q̇ᵢ eindeutig auflösen können. Für L = ½mq̇² - V ist die Hesse-Matrix ∂²L/∂q̇ᵢ∂q̇ⱼ = mδᵢⱼ positiv definit – die Bedingung ist erfüllt.
          `,
          formulas: [
            { id: "bijektiv", latex: String.raw`$$f'' > 0 \;\Rightarrow\; f' \text{ streng monoton wachsend}$$`, description: "Monotonie" },
            { id: "eindeutig", latex: String.raw`$$p = f'(x) \text{ hat für jedes } p \text{ genau ein } x^*(p)$$`, description: "Eindeutige Umkehrung" },
            { id: "hesse_matrix", latex: String.raw`$$ \dfrac{\partial^2 L}{\partial \dot{q}_i \partial \dot{q}_j} = m\delta_{ij} $$`, description: "Hesse-Matrix in der Mechanik" }
          ]
        },
        {
          title: "Geometrische Herleitung von x*",
          explanation: `
            x*(p) ist der Punkt, an dem die Tangente mit Steigung p an f anliegt. Das Supremum wird zum Maximum, weil f'' > 0 die Funktion px - f(x) konkav in x macht – ein eindeutiges Maximum existiert.
          `,
          formulas: [
            { id: "geom_derivation", latex: String.raw`$$x^*(p) = \operatorname{argmax}_x\bigl(px - f(x)\bigr)$$`, description: "Stationaritätsbedingung" },
            { id: "tangente", latex: String.raw`$$ \dfrac{d}{dx}(px - f(x)) = 0 \;\Leftrightarrow\; f'(x^*) = p $$`, description: "Tangente" }
          ]
        },
        {
          title: "Involution – die Transformation ist selbstinvers",
          explanation: `
            Der Schlüssel: Im totalen Differential von g(p) hebt sich der dx*-Term weg, weil f'(x*) = p die Stationaritätsbedingung des Supremums ist. Übrig bleibt dg = x*(p) dp – und damit dg/dp = x*. Dieselbe Transformation angewendet auf g gibt zurück f.
          `,
          formulas: [
            { id: "dg", latex: String.raw`$$dg = x^*\,dp + p\,dx^* - f'(x^*)\,dx^* = x^*\,dp $$`, description: "Totales Differential" },
            { id: "involution", latex: String.raw`$$ \dfrac{dg}{dp} = x^* \quad\text{(Involution)} $$`, description: "Selbstinvers" },
            { id: "legendre_dict", latex: String.raw`$$f(x) \;\longleftrightarrow\; L(q,\dot{q},t) \text{ als Funktion von } \dot{q}$$`, description: "Wörterbuch: Mathematik ↔ Mechanik" }
          ]
        },
        {
          title: "L → H Herleitung in drei Schritten",
          explanation: `
            Die Hamilton-Funktion ist die Legendre-Transformierte der Lagrange-Funktion bezüglich der Geschwindigkeiten. Dieser Variablenwechsel von (q, q̇) nach (q, p) führt zu den kanonischen Gleichungen.
          `,
          formulas: [
            { id: "canonical_momentum", latex: String.raw`$$p_i := \dfrac{\partial L}{\partial \dot{q}_i} \quad\text{(kanonischer Impuls)}$$`, description: "Schritt 1: Impuls definieren" },
            { id: "hamilton_def", latex: String.raw`$$H(q,p,t) := \sum_i p_i\,\dot{q}_i(q,p) - L\!\left(q,\,\dot{q}(q,p),\,t\right)$$`, description: "Schritt 2: H definieren" },
            { id: "dH", latex: String.raw`$$dH = \sum_i\!\left(\dot{q}_i\,dp_i - \dfrac{\partial L}{\partial q_i}\,dq_i\right) - \dfrac{\partial L}{\partial t}\,dt$$`, description: "Schritt 3: Differential" },
            { id: "hamilton_eq", latex: String.raw`$$ \dot{q}_i = \dfrac{\partial H}{\partial p_i},\quad \dot{p}_i = -\dfrac{\partial H}{\partial q_i} $$`, description: "Kanonische Gleichungen" }
          ]
        },
        {
          title: "De Donder-Weyl-Formalismus",
          explanation: `
            Im Punkt-Fall war die Legendre-Transformation ein Variablenwechsel von φ zu genau einem kanonischen Impuls – weil es genau eine unabhängige Variable (die Zeit) gab. Wenn φ von mehreren Variablen abhängt, hat jede ihre eigene konjugierte Ableitung. Die Legendre-Transformation kann man über alle gleichzeitig machen. Das Ergebnis ist der De Donder-Weyl-Hamiltonian H_DW mit einem Poly-Impuls pⁱ pro Variable λᵢ.
          `,
          formulas: [
            { id: "poly_momentum", latex: String.raw`$$p^{i} := \dfrac{\partial\mathcal{L}}{\partial\varphi_{i}'} \qquad \text{ein Poly-Impuls pro Variable }\lambda_i$$`, description: "Poly-Impuls Definition" },
            { id: "hdw_def", latex: String.raw`$$H_{\mathrm{DW}}\!\left(\varphi,\,p^0,\ldots,p^n\right) := \sum_{i=0}^{n} p^{i}\,\varphi_{i}'\!\left(\varphi,p\right) - \mathcal{L}\!\left(\varphi,\varphi_{i}'(\varphi,p)\right)$$`, description: "De Donder-Weyl-Hamiltonian" },
            { id: "ddw_equations", latex: String.raw`$$ \dfrac{\partial H_{\mathrm{DW}}}{\partial p^{i}} = \varphi_{i}' \quad\text{und}\quad \sum_{i=0}^{n}\dfrac{\partial}{\partial\lambda_i} p^{i} = -\dfrac{\partial H_{\mathrm{DW}}}{\partial\varphi} $$`, description: "De Donder-Weyl-Gleichungen" }
          ]
        }
      ]
    },

    "violet": {
      key: "violet",
      title: "Feldtheorie & Verallgemeinerung",
      color: "violet",
      subSections: [
        {
          title: "Euler-Lagrange für beliebig viele unabhängige Variablen",
          explanation: `
            Die bisherige Euler-Lagrange-Gleichung behandelt ein System mit einer einzigen unabhängigen Variable – der Zeit t. Das ist aber kein Sonderfall, sondern das unterste Glied einer Hierarchie: Für jede unabhängige Variable, von der das Feld abhängt, liefert das Prinzip der stationären Wirkung genau einen weiteren Term in der EL-Gleichung.
            
            Statt q̇ gibt es dann φᵢ' – die partielle Ableitung von φ nach jeder unabhängigen Variable λᵢ. Jeder solche Term entsteht durch partielle Integration in genau dieser Variable, und jeder Randterm verschwindet auf dieselbe Art wie im Punktfall.
          `,
          formulas: [
            { id: "action_point", latex: String.raw`$$S[q] = \int L\!\left(q,\,\partial_{\lambda_0} q\right) d\lambda_0$$`, description: "Wirkung (Punktmechanik)" },
            { id: "action_general", latex: String.raw`$$S[\varphi] = \int \mathcal{L}\!\left(\varphi,\;\partial_{\lambda_0}\varphi,\;\ldots,\;\partial_{\lambda_n}\varphi\right) d^{n+1}\!\lambda$$`, description: "Wirkung (allgemeines Feld)" },
            { id: "el_general", latex: String.raw`$$ \dfrac{\partial\mathcal{L}}{\partial\varphi} - \sum_{i=0}^{n}\dfrac{\partial}{\partial\lambda_i}\!\left(\dfrac{\partial\mathcal{L}}{\partial\varphi_{i}'}\right) = 0 $$`, description: "Allgemeine EL-Gleichung" }
          ],
          comparison: {
            leftTitle: "Eine Variable (n=0)",
            rightTitle: "Vier Variablen (n=3)",
            leftContent: [
              { id: "case_point", latex: String.raw`$$n = 0,\quad \varphi = q(t),\quad \lambda_0 = t$$`, description: "Punktmechanik" },
              { id: "el_point", latex: String.raw`$$ \dfrac{\partial L}{\partial q} - \dfrac{d}{dt}\dfrac{\partial L}{\partial \dot{q}} = 0 $$`, description: "Gewohnte EL-Gleichung" }
            ],
            rightContent: [
              { id: "case_4d", latex: String.raw`$$n = 3,\quad \varphi = \varphi(t,x,y,z),\quad \lambda_\mu = (t,\vec{r}\,)$$`, description: "Relativistisches Feld" },
              { id: "el_4d", latex: String.raw`$$ \dfrac{\partial\mathcal{L}}{\partial\varphi} - \partial_\mu\dfrac{\partial\mathcal{L}}{\partial(\partial_\mu\varphi)} = 0 \quad \text{(Einstein-Summe)} $$`, description: "Grundlage der Quantenfeldtheorie" }
            ]
          }
        },
        {
          title: "Longitudinalwelle im Stab",
          explanation: `
            Ein elastischer Stab wird angeregt, es breitet sich eine Longitudinalwelle aus. Als verallgemeinerte Koordinate wählt man die lokale Dehnung ε(x,t). Da ε ein Feld in Ort und Zeit ist, gilt die Feld-Euler-Lagrange-Gleichung – mit einem zusätzlichen Term für die örtliche Ableitung ε'.
          `,
          formulas: [
            { id: "long_kinetic", latex: String.raw`$$T = \dfrac{1}{2}\rho\dot{\varepsilon}^{2} \quad \text{(kin. Energiedichte)}$$`, description: "Kinetische Energiedichte" },
            { id: "long_potential", latex: String.raw`$$V = \dfrac{1}{2}E(\varepsilon')^{2} \quad \text{(elast. Energiedichte)}$$`, description: "Potentielle Energiedichte" },
            { id: "long_lagrangian", latex: String.raw`$$ \mathcal{L} = \dfrac{1}{2}\rho\dot{\varepsilon}^{2} - \dfrac{1}{2}E(\varepsilon')^{2} $$`, description: "Lagrangedichte" },
            { id: "long_el", latex: String.raw`$$ \dfrac{\partial}{\partial t}\dfrac{\partial\mathcal{L}}{\partial\dot{\varepsilon}} - \dfrac{\partial}{\partial x}\dfrac{\partial\mathcal{L}}{\partial\varepsilon'} = 0 $$`, description: "Feld-Euler-Lagrange" },
            { id: "wave_eq", latex: String.raw`$$ \ddot{\varepsilon} = c^{2}\varepsilon'' \quad \text{mit} \quad c = \sqrt{E/\rho} $$`, description: "Wellengleichung" }
          ]
        }
      ]
    },

    "teal": {
      key: "teal",
      title: "Elektrische Systeme",
      color: "teal",
      subSections: [
        {
          title: "LC-Schwingkreis",
          explanation: `
            Ein LC-Schwingkreis besteht aus einer Spule (Induktivität L) und einem Kondensator (Kapazität C) in Serie. Als verallgemeinerte Koordinate wählt man die Ladung Q. Dieselbe Gleichung wie beim mechanischen Oszillator – andere Größen.
          `,
          formulas: [
  { id: "lc_energy", latex: String.raw`$$T = \dfrac{1}{2}L\dot{Q}^{2} \quad \text{(magn. Energie der Spule)}$$` as string, description: "Kinetische Energie" },
  { id: "lc_potential", latex: String.raw`$$V = \dfrac{Q^{2}}{2C} \quad \text{(elektr. Energie des Kondensators)}$$` as string, description: "Potentielle Energie" },
  { id: "lc_lagrangian", latex: String.raw`$$ \mathcal{L} = \dfrac{1}{2}L\dot{Q}^{2} - \dfrac{Q^{2}}{2C} $$` as string, description: "Lagrangian" },
  { id: "lc_wave", latex: String.raw`$$ \ddot{Q} + \omega_{0}^{2} Q = 0 \quad \text{mit} \quad \omega_{0} = \dfrac{1}{\sqrt{LC}} $$` as string, description: "Schwingungsgleichung" }
]
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

<div class="min-h-screen bg-surface-950 text-surface-50" style="font-family: 'DM Mono', monospace;">

  <!-- HEADER -->
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

  <main class="max-w-7xl mx-auto px-8 py-12 flex flex-col gap-12">

    <!-- INTRO -->
    <section>
      <div class="flex items-center gap-3 mb-8">
        <span class="text-xs px-2 py-0.5 rounded border tracking-wider uppercase text-surface-300 border-surface-500/30 bg-surface-600/10">Willkommen</span>
        <h2 class="text-lg font-light text-surface-200" style="font-family: 'Fraunces', serif;">Theorie der klassischen Mechanik</h2>
      </div>
    </section>

    <!-- 6 HAUPT-COLLAPSIBLES (FARBTHEMEN) -->
    {#each Object.values(themes) as theme (theme.key)}
      <section>
        <div class="flex items-center gap-3 mb-6">
          <span class="text-xs px-2 py-0.5 rounded border tracking-wider uppercase text-surface-400 border-surface-600/30 bg-surface-700/20">Theorie</span>
          <h2 class="text-lg font-light text-surface-200" style="font-family: 'Fraunces', serif;">
            {theme.title}
          </h2>
        </div>

        <!-- EINZIGES COLLAPSIBLE PRO THEMA -->
        <Collapsible class="w-full md:max-w-5xl lg:max-w-6xl rounded-xl border overflow-hidden">
  <!-- 100% auf Handys, max 1024px auf Tablets, max 1152px auf Desktops -->
          <Collapsible.Trigger class="{getTriggerClasses(theme.color)}">
            <div class="flex items-center gap-4 px-2">
              <span class="{getBadgeClasses(theme.color)}">
                {theme.title.split(' ')[0]}
              </span>
              <span class="text-surface-300 text-sm">Alle Unterpunkte anzeigen ({theme.subSections.length})</span>
            </div>
            <svg class="w-4 h-4 px-2 text-surface-400 transition-transform [[data-state=open]_&]:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>
          </Collapsible.Trigger>

          <Collapsible.Content class="border-t border-surface-700/30 bg-surface-900/40">
            <div class="px-6 py-5 space-y-8">
              
              {#each theme.subSections as subSection (subSection.title)}
                <div class="border-t border-surface-700/30 pt-6 first:border-t-0 first:pt-0">
                  
                  <!-- Unterpunkt Titel -->
                  <h3 class="text-base font-medium text-surface-200 mb-3">{subSection.title}</h3>
                  
                  <!-- Erklärung -->
                  <p class="text-sm text-surface-400 leading-relaxed mb-4 whitespace-pre-line">{subSection.explanation}</p>

                  <!-- Formeln -->
                  {#if subSection.formulas.length > 0}
                    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-4">
                      <div class="flex flex-col gap-3 text-sm text-surface-400 leading-relaxed">
                        <p>Wichtige Gleichungen:</p>
                      </div>
                      <div class="flex flex-col gap-4">
                        {#each subSection.formulas as formula (formula.id)}
                          <div class="text-surface-300 text-xs bg-surface-900/80 rounded-lg px-4 py-3 border border-surface-700 leading-loose">
                            {@html formula.latex}
                          </div>
                          {#if formula.description}
                            <p class="text-xs text-surface-500">{formula.description}</p>
                          {/if}
                        {/each}
                      </div>
                    </div>
                  {/if}

                  <!-- Vergleichs-Layout (comparison) -->
                  {#if subSection.comparison}
                    <div class="border-t border-surface-700/30 pt-6 mt-6">
                      <p class="text-xs uppercase tracking-widest text-surface-400 mb-4">Spezialfälle</p>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <!-- Linke Spalte -->
                        <div class="rounded-xl border border-surface-600/30 bg-surface-800/20 p-5 flex flex-col gap-3">
                          <p class="text-xs uppercase tracking-widest text-surface-400">{subSection.comparison.leftTitle}</p>
                          {#each subSection.comparison.leftContent as formula (formula.id)}
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
                          <p class="text-xs uppercase tracking-widest text-surface-400">{subSection.comparison.rightTitle}</p>
                          {#each subSection.comparison.rightContent as formula (formula.id)}
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

                  <!-- Two-Column Layout (twoColumn) -->
                  {#if subSection.twoColumn}
                    <div class="border-t border-surface-700/30 pt-6 mt-6">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <!-- Linke Spalte -->
                        <div class="rounded-xl border border-surface-600/30 bg-surface-800/20 p-5">
                          <p class="text-xs uppercase tracking-widest text-surface-400 mb-3">{subSection.twoColumn.leftTitle}</p>
                          <div class="text-surface-300 text-xs">
                            {@html subSection.twoColumn.leftContent}
                          </div>
                        </div>

                        <!-- Rechte Spalte -->
                        <div class="rounded-xl border border-surface-600/30 bg-surface-800/20 p-5">
                          <p class="text-xs uppercase tracking-widest text-surface-400 mb-3">{subSection.twoColumn.rightTitle}</p>
                          <div class="text-surface-300 text-xs">
                            {@html subSection.twoColumn.rightContent}
                          </div>
                        </div>

                      </div>
                    </div>
                  {/if}

                </div>
              {/each}

            </div>
          </Collapsible.Content>
        </Collapsible>

      </section>
    {/each}

  </main>

</div>