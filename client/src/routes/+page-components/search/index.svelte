<script lang="ts">
  import type FeaturedLink from '$lib/interfaces/FeaturedLink'
  import FeaturedLinks from './FeaturedLinks.svelte'

  export let className = ''
  export let isShrinked = false
  export let featuredLinks: FeaturedLink[] = [
    { name: 'Слава КПСС', url: 'https://genius.com/artists/Slava-kpss' },
  ]

  let isFocused = false

  function onFocus() {
    isFocused = true
  }

  function onBlur() {
    isFocused = false
  }
</script>

<div class={'search ' + className} class:shrinked={isShrinked}>
  <div class="search__input-button-container" class:shrinked={isShrinked}>
    <div class="search__input-container">
      <div class="search__background" class:focused={isFocused} />
      <input
        class="search__input"
        type="text"
        on:focus={onFocus}
        on:blur={onBlur}
        placeholder="genius url, e.g: https://genius.com/artists/Slava-kpss"
      />
    </div>

    <button class="search__button"> Анализировать </button>
  </div>

  <FeaturedLinks className="search__featured" {featuredLinks} />
</div>

<style lang="scss">
  .search {

    :global(.search__featured) {
      margin-top: 16px;
      transition: margin 0.3s, opacity 0.3s;
    }

    &.shrinked {
      :global(.search__featured) {
        margin-top: -20px;
        opacity: 0;
      }
    }
  }

  .search__input-button-container {
    height: 72px;
    display: flex;
    transition: height 0.4s;

    &.shrinked {
      height: 40px;
    }
  }

  .search__button {
    background-color: var(--color-bg-contrast);
    color: var(--color-text-contrast);
    font-size: inherit;
    border-radius: 24px;
    border: none;
    padding: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 176px;
    flex-shrink: 0;
    margin-left: 16px;
    font-family: inherit;
    cursor: pointer;
  }

  .search__input-container {
    padding: 4px 24px;
    box-sizing: border-box;
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    height: 100%;
    width: 100%;
  }

  .search__background {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    z-index: 0;
    background: var(--gradient-pink-light-blue);
    transition: transform 0.4s linear;
    width: 100%;
    padding-top: 100%;

    &.focused {
      transform: translateY(-50%) rotate(90deg);
    }

    &.loading {
      animation: loading-animation 3s infinite linear;
    }
  }

  @keyframes loading-animation {
    from {
      transform: translateY(-50%) rotate(0deg);
    }

    to {
      transform: translateY(-50%) rotate(360deg);
    }
  }

  .search__input {
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    border: none;
    padding: 0 16px;
    border-radius: 20px;
    outline: none;
    font-size: inherit;
    font-family: inherit;
    color: var(--color-text-contrast);
    z-index: 1;
    position: relative;
    font-weight: 300;
  }
</style>
