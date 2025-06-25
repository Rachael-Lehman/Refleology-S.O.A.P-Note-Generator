<script>
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  let user = null;
  let showDeleteModal = false;
  let sliderValue = 0;
  let sliderMax = 100;
  let deleting = false;

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
   
$: {
    const el = document.querySelector('.slider');
    if (el) el.style.setProperty('--value', sliderValue);
  }
  async function handleDelete() {
    if (sliderValue >= sliderMax) {
      deleting = true;
      window.location.href = "http://localhost:3000/auth/google/delete";
    }
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
          <a href="#clients-listed" class="text-gray-700 hover:text-blue-600"
            >Client List</a
          >
          <a href="#saved-notes" class="text-gray-700 hover:text-blue-600"
            >Saved Notes</a
          >
        </div>
      {/if}

      <!-- User Menu -->
      <div class="flex items-center gap-4">
        {#if user}
          <span class="text-sm text-gray-700">Welcome, {user.name}</span>
          <button
            on:click={logout}
            class="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-600"
          >
            Sign Out
          </button>
          <button
            on:click={() => (showDeleteModal = true)}
            class="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
          >
            Delete Account
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

{#if showDeleteModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-96 relative">
      <h2 class="text-lg font-semibold mb-4 text-center text-red-600">
        Confirm Account Deletion
      </h2>
      <p class="text-sm text-center mb-6 text-gray-700">
        This action is permanent and cannot be undone. If you're absolutely sure, slide to confirm.
      </p>

      <!-- Native slider with colored track -->
      <div class="mb-6">
        <input
          type="range"
          min="0"
          max={sliderMax}
          bind:value={sliderValue}
          class="w-full slider"
        />
        <div class="text-center text-black font-bold mt-2">
          {sliderValue >= sliderMax ? "Confirmed" : "Slide to Confirm"}
        </div>
      </div>

      <div class="flex justify-between">
        <button
          on:click={() => { showDeleteModal = false; sliderValue = 0; }}
          class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Cancel
        </button>

        <button
          disabled={sliderValue < sliderMax || deleting}
          on:click={handleDelete}
          class="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-red-700"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
{/if}


<style>
  /* Total reset of default range appearance */
input[type="range"].slider {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 2.5rem;
  background: linear-gradient(
    to right,
    red 0%,
    red calc(var(--value, 0%) * 1%),
    #e5e7eb calc(var(--value, 0%) * 1%),
    #e5e7eb 100%
  );
  border-radius: 9999px;
  outline: none;
  position: relative;
}

/* We update --value dynamically with JS */
input[type="range"].slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  height: 2.5rem;
  width: 2.5rem;
  background: white;
  border: 3px solid red;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background 0.3s;
}

input[type="range"].slider::-moz-range-thumb {
  height: 2.5rem;
  width: 2.5rem;
  background: white;
  border: 3px solid red;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background 0.3s;
}

</style>
