<script>
  import { scale } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let message = '';
  export let type = 'info';
  
  const dispatch = createEventDispatcher();
  const duration = 3000;

  setTimeout(() => {
    dispatch('close');
  }, duration);
</script>

<div
  class="fixed top-[100px] right-4 p-4 rounded-lg shadow-lg max-w-sm"
  class:bg-blue-100={type === 'info'}
  class:text-blue-900={type === 'info'}
  class:bg-green-100={type === 'success'}
  class:text-green-900={type === 'success'}
  class:bg-red-100={type === 'error'}
  class:text-red-900={type === 'error'}
  transition:scale={{ duration: 300 }}
>
  {message}
</div>

