<script>
  export let id = '';
  export let title = '';
</script>

<div {id} class="pt-24 mt-8 first:mt-0">
  {#if title}
    <h1 class="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
      {title}
    </h1>
  {/if}
  <slot />
</div>
