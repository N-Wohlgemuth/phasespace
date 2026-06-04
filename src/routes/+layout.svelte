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

