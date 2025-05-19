<script>
  import { onMount } from 'svelte';
  let user = null;

  // Fetch user session
  onMount(async () => {
    const res = await fetch('http://localhost:3000/api/user', {
      credentials: 'include'
    });
    if (res.ok) {
      user = await res.json();
    }
  });

  // ✅ Logout function lives here
  async function logout() {
  await fetch('http://localhost:3000/api/logout', {
    method: 'POST',
    credentials: 'include'
  });

  user = null;
  window.location.reload(); // Force re-check from server
}


  function loginWithGoogle() {
    window.location.href = 'http://localhost:3000/auth/google';
  }
</script>

<nav>
  {#if user}
    <span>Welcome, {user.displayName}</span>
    <button on:click={logout}>Sign Out</button>
  {:else}
    <button on:click={loginWithGoogle}>Login with Google</button>
  {/if}
</nav>
