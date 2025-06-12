<script>
    import { onMount } from 'svelte';
  
    let user = null;
  
    onMount(async () => {
      const res = await fetch('http://localhost:3000/api/user', {
        credentials: 'include'
      });
      user = await res.json();
    });
  </script>
  
  {#if user}
    <p>Welcome, {user.displayName}</p>
  {:else}
    <p>Please log in.</p>
  {/if}
  