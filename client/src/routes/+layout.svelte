<script>
  import '$lib/styles/index.scss'
</script>

<div class="layout">
  <slot />
</div>

<style lang="scss">
  .layout {
    max-width: 960px;
    margin: auto;
  }
</style>
