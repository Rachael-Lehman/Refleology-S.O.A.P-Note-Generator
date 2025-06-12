<script>
  import { onMount } from "svelte";
  let user = null;

  // Fetch user session
  onMount(async () => {
    const res = await fetch("http://localhost:3000/api/user", {
      credentials: "include",
    });
    if (res.ok) {
      user = await res.json();
    }
  });

  // ✅ Logout function lives here
  async function logout() {
    await fetch("http://localhost:3000/api/logout", {
      method: "POST",
      credentials: "include",
    });

    user = null;
    window.location.reload(); // Force re-check from server
  }

  function loginWithGoogle() {
    window.location.href = "http://localhost:3000/auth/google";
  }
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <!-- Logo/Brand -->
      <div class="flex items-center">
        <span class="text-lg font-semibold">SOAP Notes</span>
      </div>

      <!-- Navigation Links -->
      {#if user}
        <div class="hidden md:flex space-x-8">
          <a href="#subjective" class="text-gray-700 hover:text-blue-600"
            >Subjective</a
          >
          <a href="#objective" class="text-gray-700 hover:text-blue-600"
            >Objective</a
          >
          <a href="#action" class="text-gray-700 hover:text-blue-600">Action</a>
          <a href="#plan" class="text-gray-700 hover:text-blue-600">Plan</a>
          <a href="#saved-notes" class="text-gray-700 hover:text-blue-600"
            >Existing Notes</a
          >
        </div>
      {/if}

      <!-- User Menu -->
      <div class="flex items-center gap-4">
        {#if user}
          <span class="text-sm text-gray-700">Welcome, {user.name}</span>
          <button
            on:click={logout}
            class="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
          >
            Sign Out
          </button>
        {:else}
          <button
            on:click={loginWithGoogle}
            class="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
          >
            Login with Google
          </button>
        {/if}
      </div>
    </div>
  </div>
</nav>
