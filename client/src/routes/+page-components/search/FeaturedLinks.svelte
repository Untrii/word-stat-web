<script lang="ts">
  import type FeaturedLink from '$lib/interfaces/FeaturedLink'

  export let className = ''
  export let featuredLinks: FeaturedLink[] = []
</script>

<div class={'featured-links ' + className}>
  Вставить URL:

  <ul class="featured-links__list">
    {#each featuredLinks as featuredLink}
      <li class="featured-links__list-item">
        <a class="featured-links__link" href={featuredLink.url}>{featuredLink.name}</a>
      </li>
    {/each}
  </ul>
</div>

<style lang="scss">
  .featured-links {
    display: flex;
  }

  .featured-links__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .featured-links__list-item {
    margin-left: 16px;
  }

  .featured-links__link {
    color: var(--color-text-primary);
  }
</style>