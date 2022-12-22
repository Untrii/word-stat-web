<script>
  import Search from './+page-components/search/index.svelte'

  let isShrinked = false
</script>

<header class="page-home__header">
  <h1 class="page-home__title">
    Частотная статистика дискографии ваших любимых реперов в виде on-line SaaS сервиса в сети
    Интернет (Web 2.0, блок-чейн не завезли) Кеннинг Матье его таун E16, бейби
  </h1>
</header>

<main class="page-home__main">
  <Search {isShrinked} />

  <div class="page-home__status">Ваш запрос добавлен в очередь <br /> Место в очереди: 3</div>
</main>

<style lang="scss">
  @import '$lib/styles/mixins.scss';

  .page-home__header {
    padding: 32px 0;
  }

  .page-home__title {
    @include font-size-xl;
    max-width: 617px;
    font-weight: 400;
    margin: auto;
    text-align: center;
  }

  .page-home__main {
    padding: 64px 0;
  }

  .page-home__status {
    margin-top: 64px;
    @include font-size-lg;
    text-align: center;
  }
</style>
