<script>
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  let user = null;
  let showDeleteModal = false;
  let sliderValue = 0;
  let sliderMax = 100;
  let deleting = false;
  let mobileMenuOpen = false;
  let API_URL = import.meta.env.VITE_BackEnd_URL;

  // Fetch user session
  onMount(async () => {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/user`, {
        credentials: "include",
      });
      if (res.ok) {
        user = await res.json();
      }
    }
  });

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  async function logout() {
    if (API_URL) {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      user = null;
      window.location.reload(); // Force re-check from server
    }
  }

  function loginWithGoogle() {
    if (API_URL) window.location.href = `${API_URL}/auth/google`;
  }

  $: {
    const el = document.querySelector(".slider");
    if (el) el.style.setProperty("--value", sliderValue);
  }

  async function handleDelete() {
    if (sliderValue >= sliderMax && API_URL) {
      deleting = true;
      window.location.href = `${API_URL}/auth/google/delete`;
    }
  }
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
  <div class="container mx-auto px-4">
    <div class="flex flex-wrap items-center justify-around h-20">
      <!-- Logo/Brand -->
      <div class="flex items-center">
        <span class="text-lg font-semibold">SOAP Notes</span>
      </div>

      <!-- Hamburger + Welcome text for mobile -->
      {#if user}
        <div class="md:hidden flex items-center gap-4">
          <span class="text-sm text-gray-700">Welcome, {user.name}</span>

          <div class="flex flex-col items-center">
            <span class="text-xs text-gray-700">Menu</span>
            <button
              class="focus:outline-none hover:bg-gray-200 rounded-full p-2 transition transform hover:scale-110"
              on:click={toggleMobileMenu}
              aria-label="Open navigation menu"
            >
              <svg
                class="h-6 w-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      {/if}

      <!-- Desktop navigation links -->
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

      <!-- User menu for desktop -->
      <div class="hidden md:flex items-center gap-4">
        {#if user}
          <span class="text-sm text-gray-700 hidden sm:inline"
            >Welcome, {user.name}</span
          >
          <button
            on:click={logout}
            class="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-600"
            >Sign Out</button
          >
          <button
            on:click={() => (showDeleteModal = true)}
            class="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
            >Delete Account</button
          >
        {:else}
          <button
            on:click={loginWithGoogle}
            class="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
            >Login with Google</button
          >
        {/if}
      </div>
    </div>

    <!-- Mobile menu links -->
    {#if user && mobileMenuOpen}
      <div class="md:hidden flex flex-col space-y-2 mt-4 pb-4">
        <a
          href="#subjective"
          class="text-gray-700 hover:text-blue-600"
          on:click={toggleMobileMenu}>Subjective</a
        >
        <a
          href="#objective"
          class="text-gray-700 hover:text-blue-600"
          on:click={toggleMobileMenu}>Objective</a
        >
        <a
          href="#action"
          class="text-gray-700 hover:text-blue-600"
          on:click={toggleMobileMenu}>Action</a
        >
        <a
          href="#plan"
          class="text-gray-700 hover:text-blue-600"
          on:click={toggleMobileMenu}>Plan</a
        >
        <a
          href="#clients-listed"
          class="text-gray-700 hover:text-blue-600"
          on:click={toggleMobileMenu}>Client List</a
        >
        <a
          href="#saved-notes"
          class="text-gray-700 hover:text-blue-600"
          on:click={toggleMobileMenu}>Saved Notes</a
        >
        <div class="flex flex-col gap-2 pt-4 border-t">
          <button
            on:click={() => {
              logout();
              toggleMobileMenu();
            }}
            class="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-600"
            >Sign Out</button
          >
          <button
            on:click={() => {
              showDeleteModal = true;
              toggleMobileMenu();
            }}
            class="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
            >Delete Account</button
          >
        </div>
      </div>
    {/if}
  </div>
</nav>

{#if showDeleteModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
  >
    <div class="bg-white rounded-lg shadow-lg p-6 w-96 relative">
      <h2 class="text-lg font-semibold mb-4 text-center text-red-600">
        Confirm Account Deletion
      </h2>
      <p class="text-sm text-center mb-6 text-gray-700">
        This action is permanent and cannot be undone. If you're absolutely
        sure, slide to confirm.
      </p>

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
          on:click={() => {
            showDeleteModal = false;
            sliderValue = 0;
          }}
          class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >Cancel</button
        >

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
