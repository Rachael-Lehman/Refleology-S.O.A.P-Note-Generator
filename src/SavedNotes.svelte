<script>
  import { onMount } from 'svelte';
  import { Button } from 'flowbite-svelte';
  import Toast from './lib/Toast.svelte';

  let savedNotes = {};
  let isLoading = true;
  let error = null;
  let toast = null;

  let user = null;

  onMount(async () => {
    await checkAuth();
    if (user) {
      await fetchSavedNotes();
    }
  });

  async function checkAuth() {
    try {
      const API_URL = 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/user`, {
        credentials: 'include'
      });
      if (res.ok) {
        user = await res.json();
        console.log('Auth status:', user ? 'Logged in' : 'Not logged in');
      } else {
        console.error('Auth check failed:', await res.text());
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  }

  async function fetchSavedNotes() {
    try {
      isLoading = true;
      const API_URL = 'http://localhost:3000';
      console.log('Fetching notes...');
      const res = await fetch(`${API_URL}/list-notes`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Raw response data:', data);
        // Force reactivity by creating a new object
        savedNotes = { ...data };
        // Log each client's notes for debugging
        Object.entries(savedNotes).forEach(([client, notes]) => {
          console.log(`Client ${client}:`, notes);
        });
        console.log('Number of clients:', Object.keys(savedNotes).length);
      } else {
        const errorText = await res.text();
        console.error('Server response not OK:', res.status, errorText);
        throw new Error('Failed to fetch notes: ' + errorText);
      }
    } catch (err) {
      console.error('Error fetching saved notes:', err);
      error = err.message;
      toast = { message: 'Failed to load saved notes', type: 'error' };
    } finally {
      isLoading = false;
    }
  }
</script>

<main class="pt-[100px] container mx-auto px-4">
  <h1 class="text-2xl font-bold mb-6">Saved SOAP Notes</h1>

  {#if isLoading}
    <div class="flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  {:else if error}
    <div class="p-4 bg-red-100 border border-red-300 rounded">
      <p class="text-red-700">{error}</p>
      <Button on:click={fetchSavedNotes} class="mt-2">Try Again</Button>
    </div>
  {:else if Object.keys(savedNotes).length === 0}
    <div class="p-4 bg-gray-100 border border-gray-300 rounded">
      <p class="text-gray-700">No saved notes found.</p>
    </div>
  {:else}
    <div class="space-y-8">
      {#each Object.entries(savedNotes) as [clientName, notes] (clientName)}
        {@debug clientName, notes}
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold mb-4 text-blue-600 border-b pb-2">
            {clientName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </h2>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each notes as note (note.key)}
              {@debug note}
              <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-medium truncate flex-1">
                    {new Date(note.fileName.split('_')[0]).toLocaleDateString()}
                  </h3>
                  <a 
                    href={note.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="ml-2 inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded"
                  >
                    📄 View
                  </a>
                </div>
                <div class="text-sm text-gray-500">
                  Created: {new Date(note.fileName.split('_')[1].split('.')[0]).toLocaleString()}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div}
  {/if}

  {#if toast}
    <Toast 
      message={toast.message} 
      type={toast.type}
      on:close={() => toast = null}
    />
  {/if}
</main>
