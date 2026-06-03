<script lang="ts">
  import './layout.css';
   import '../app.css';

  let { children } = $props();
</script>


<svelte:head>
  <!--<link rel="icon" href={favicon} />-->
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['$$', '$$']]
      }
    };
  </script>
 <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
</svelte:head>

<div class="h-full" >
  {@render children()}
</div>

<footer class="border-t border-surface-200-700-token bg-surface-50-900-token">
  <div class="max-w-5xl mx-auto px-8 py-4 flex flex-col items-center gap-3">
    <nav class="flex items-center gap-8" aria-label="Footer-Navigation">
      
      <a  href="/impressum.html"
        class="flex items-center gap-1.5 text-sm text-surface-500-400-token
               hover:text-surface-900-50-token transition-colors"
      >
        <i class="ti ti-file-description text-sm" aria-hidden="true"></i>
        Impressum
      </a>

      <span class="w-1 h-1 rounded-full bg-surface-300-600-token" aria-hidden="true"></span>

      
      <a  href="/privacy.html"
        class="flex items-center gap-1.5 text-sm text-surface-500-400-token
               hover:text-surface-900-50-token transition-colors"
      >
        <i class="ti ti-shield-lock text-sm" aria-hidden="true"></i>
        Datenschutzerklärung
      </a>
    </nav>

    <p class="text-xs text-surface-400-500-token tracking-wide">
      © {new Date().getFullYear()} · Alle Rechte vorbehalten
    </p>
  </div>
</footer>