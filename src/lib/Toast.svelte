<script>
  import { createEventDispatcher } from "svelte";
  import { scale } from "svelte/transition";

  export let message = "";
  export let type = "info";
  let show = true;

  const dispatch = createEventDispatcher();

  setTimeout(() => {
    show = false;
    setTimeout(() => {
      dispatch("done");
    }, 300); 
  }, 3000);
</script>

{#if show}
  <div
    class="fixed top-[100px] right-4 p-4 rounded-lg shadow-lg max-w-sm"
    class:bg-blue-100={type === "info"}
    class:text-blue-900={type === "info"}
    class:bg-green-100={type === "success"}
    class:text-green-900={type === "success"}
    class:bg-red-100={type === "error"}
    class:text-red-900={type === "error"}
    transition:scale={{ duration: 300 }}
  >
    {message}
  </div>
{/if}
