<!-- ClientNotes.svelte -->
<script>
  import { onMount } from "svelte";
  export let clientName;

  let notes = [];
  let error = null;
  let isLoading = true;
  let API_URL = import.meta.env.VITE_BackEnd_URL;

  onMount(async () => {
    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}/list-notes`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data[clientName]) {
          notes = data[clientName];
        } else {
          error = "No notes found for this client.";
        }
      }
    } catch (err) {
      error = "Failed to load notes.";
    } finally {
      isLoading = false;
    }
  });

  function extractDate(fileName) {
    return new Date(fileName.split("_")[0]).toLocaleDateString();
  }

  function extractTime(fileName) {
    const timestamp = fileName
      .split("_")[1]
      ?.replace(".pdf", "")
      .replace(/-/g, ":");
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString();
  }

  function formatClientName(name) {
    return name
      .replace(/^clients\//, "")
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
</script>

<main class="pt-[100px] container mx-auto px-4">
  <h1 class="text-2xl font-bold mb-6">
    Notes for {formatClientName(clientName)}
  </h1>

  {#if isLoading}
    <p>Loading notes...</p>
  {:else if error}
    <p class="text-red-600">{error}</p>
  {:else}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each notes as note}
        <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-medium truncate flex-1">
              {extractDate(note.fileName)}
            </h3>
            <a
              href={note.url}
              target="_blank"
              rel="noopener noreferrer"
              class="ml-2 text-blue-600 hover:underline"
            >
              📄 View
            </a>
          </div>
          <div class="text-sm text-gray-500">
            Created: {extractTime(note.fileName)}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</main>
