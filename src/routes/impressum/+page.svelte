<!-- src/routes/impressum/+page.svelte -->
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

  .accent-link {
    color: #C9900F;
    transition: opacity 0.2s;
  }
  .accent-link:hover { opacity: 0.7; }

  .mono-sm {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.72rem;
  }

  .label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(228, 224, 216, 0.3);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .a1 { animation: fadeUp 0.5s ease 0.05s both; }
  .a2 { animation: fadeUp 0.5s ease 0.15s both; }
  .a3 { animation: fadeUp 0.5s ease 0.25s both; }
  .a4 { animation: fadeUp 0.5s ease 0.35s both; }
</style>

<div class="page">
  <div class="max-w-2xl mx-auto px-6 py-16 md:py-24">

    <!-- Header -->
    <header class="mb-14 a1">
      <div class="flex items-center gap-3 mb-6">
        <span class="badge">Legal</span>
        <span class="mono-sm opacity-25">§ 5 TMG</span>
      </div>
      <h1 class="page-title">Impressum</h1>
    </header>

    <!-- Address -->
    <div class="card p-6 mb-5 a2">
      <p class="label mb-4">Anbieter</p>
      <address class="not-italic space-y-1">
        <p class="section-title">Niels Wohlgemuth</p>
        <p class="text-sm opacity-40 mt-2">Ringstraße 22</p>
        <p class="text-sm opacity-40">63322 Rödermark</p>
        <p class="text-sm opacity-40">Deutschland</p>
      </address>
    </div>

    <!-- Contact -->
    <div class="card p-6 mb-14 a3">
      <p class="label mb-4">Kontakt</p>
      <a href="mailto:niels.wohlgemuth@proton.me"
         class="accent-link inline-flex items-center gap-2 text-sm">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        niels.wohlgemuth@proton.me
      </a>
    </div>

    <!-- Footer -->
    <footer class="border-t border-white/[0.07] pt-7 flex items-center justify-between a4">
      <span class="mono-sm opacity-25">&copy; {new Date().getFullYear()} Niels Wohlgemuth</span>
      <a href="/privacy" class="accent-link mono-sm">Datenschutz →</a>
    </footer>

  </div>
</div>