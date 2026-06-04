<!-- src/routes/privacy/+page.svelte -->
<script lang="ts">
  const sections = [
    {
      title: "Allgemeines",
      content: "Der Schutz Ihrer Privatsphäre ist uns wichtig. Diese Website erhebt, verarbeitet oder speichert keine personenbezogenen Daten, es sei denn, dies ist technisch notwendig für den Betrieb oder Sie übermitteln uns aktiv Daten.",
      icon: "🛡️"
    },
    {
      title: "Server-Log-Dateien",
      content: "Der Provider erfasst automatisch Informationen über den Zugriff (IP-Adresse, Datum/Uhrzeit, Datei-Name, Browser-Typ). Diese Daten dienen ausschließlich der Sicherstellung eines stabilen Betriebs und werden nicht mit anderen Quellen zusammengeführt.",
      icon: "📊",
      list: ["IP-Adresse", "Datum & Uhrzeit", "Abgerufene Datei", "Browser & OS"]
    },
    {
      title: "Kontaktmöglichkeit",
      content: "Bei E-Mail-Kontakt speichern wir Ihre Angaben (E-Mail, ggf. Name) nur zur Bearbeitung Ihrer Anfrage. Eine Weitergabe an Dritte erfolgt nicht.",
      icon: "✉️"
    },
    {
      title: "Cookies",
      content: "Diese Website verwendet keine Cookies. Es erfolgt keine Nachverfolgung Ihres Surfverhaltens.",
      icon: "🍪"
    },
    {
      title: "Ihre Rechte",
      content: "Sie haben das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer Daten. Wenden Sie sich hierfür an die oben genannte E-Mail-Adresse.",
      icon: "⚖️"
    }
  ];
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .page {
    font-family: 'IBM Plex Sans', sans-serif;
    background-color: #0B0B0D;
    background-image:
      radial-gradient(ellipse 80% 40% at 50% -10%, rgba(205,145,30,0.07) 0%, transparent 70%),
      radial-gradient(#1c1c20 1px, transparent 1px);
    background-size: 100% 100%, 26px 26px;
    min-height: 100vh;
    color: #E4E0D8;
  }

  .page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.4rem, 5vw, 3.6rem);
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.05;
    color: #F5F0E8;
  }

  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #F0EBE0;
  }

  .badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: rgba(205, 145, 30, 0.1);
    color: #C9900F;
    border: 1px solid rgba(205, 145, 30, 0.2);
    border-radius: 3px;
    padding: 2px 8px;
  }

  .card {
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 6px;
    transition: background 0.25s ease, border-color 0.25s ease;
  }

  .card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(205, 145, 30, 0.2);
  }

  .contact-card {
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-left: 2px solid #C9900F;
    border-radius: 0 6px 6px 0;
    transition: background 0.25s ease;
  }

  .contact-card:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .timeline-line {
    border-left: 1px solid rgba(255, 255, 255, 0.08);
  }

  .timeline-dot {
    position: absolute;
    left: -5px;
    top: 1.25rem;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #0B0B0D;
    border: 1.5px solid #C9900F;
    box-shadow: 0 0 6px rgba(205, 145, 30, 0.25);
  }

  .accent-link {
    color: #C9900F;
    transition: opacity 0.2s;
  }
  .accent-link:hover {
    opacity: 0.7;
  }

  .mono-sm {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.72rem;
  }

  .tag-item {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.72rem;
    color: rgba(228, 224, 216, 0.4);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tag-item::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(205, 145, 30, 0.5);
    flex-shrink: 0;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .animate-in {
    animation: fadeUp 0.5s ease both;
  }

  .stagger-1 { animation-delay: 0.05s; }
  .stagger-2 { animation-delay: 0.12s; }
  .stagger-3 { animation-delay: 0.19s; }
  .stagger-4 { animation-delay: 0.26s; }
  .stagger-5 { animation-delay: 0.33s; }
  .stagger-6 { animation-delay: 0.40s; }
  .stagger-7 { animation-delay: 0.47s; }
  .stagger-8 { animation-delay: 0.54s; }
</style>

<div class="page">
  <div class="max-w-2xl mx-auto px-6 py-16 md:py-24">

    <!-- Header -->
    <header class="mb-14 animate-in stagger-1">
      <div class="flex items-center gap-3 mb-6">
        <span class="badge">Legal</span>
        <span class="mono-sm opacity-25">§ DSGVO</span>
      </div>
      <h1 class="page-title mb-3">Datenschutz&shy;erklärung</h1>
      <p class="mono-sm opacity-30 mt-2">
        Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
      </p>
    </header>

    <!-- Responsible Person -->
    <div class="contact-card p-6 mb-14 animate-in stagger-2">
      <span class="badge">Verantwortlicher</span>
      <address class="not-italic mt-4">
        <p class="section-title mb-1">Niels Wohlgemuth</p>
        <p class="text-sm opacity-40 mt-1">Ringstraße 22, 63322 Rödermark</p>
        <a href="mailto:niels.wohlgemuth@proton.me" class="accent-link inline-flex items-center gap-2 mt-3 text-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          niels.wohlgemuth@proton.me
        </a>
      </address>
    </div>

    <!-- Timeline -->
    <div class="relative timeline-line pl-8 space-y-6 mb-14">
      {#each sections as section, i (section.title)}
        <div class="relative animate-in" style="animation-delay: {0.2 + i * 0.07}s">
          <div class="timeline-dot"></div>
          <div class="card p-5">
            <div class="flex items-start justify-between gap-4 mb-2">
              <h2 class="section-title">{section.title}</h2>
              <span class="text-lg opacity-50 shrink-0 mt-0.5">{section.icon}</span>
            </div>
            <p class="text-sm leading-relaxed opacity-50">
              {section.content}
            </p>
            {#if section.list}
              <ul class="mt-4 grid grid-cols-2 gap-y-2 gap-x-4">
                {#each section.list as item}
                  <li class="tag-item">{item}</li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Footer -->
    <footer class="border-t border-white/[0.07] pt-7 flex items-center justify-between animate-in stagger-8">
      <span class="mono-sm opacity-25">&copy; {new Date().getFullYear()} Niels Wohlgemuth</span>
      <a href="/impressum" class="accent-link mono-sm">Impressum →</a>
    </footer>

  </div>
</div>