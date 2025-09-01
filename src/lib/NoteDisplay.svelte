<script>
  import { Button } from "flowbite-svelte";

  export let note = "";
  export let isUploading = false;
  export let googleDocsEnabled = false;
  export let onCopy = () => {};
  export let upload = () => {};
</script>

<div class="mt-8">
  <h2 class="text-xl font-bold mb-4">Generated SOAP Note</h2>

  <!-- Small centered message -->
  <div class="text-center text-sm text-gray-600 mb-2">
    Review and edit before submitting.
  </div>

  <div class="relative">
    <div class="absolute right-8 top-2">
      <Button
        size="sm"
        color="light"
        class="flex items-center gap-2 bg-white shadow-sm hover:bg-gray-100"
        on:click={onCopy}
      >
        📋 Copy Note
      </Button>
    </div>
    <textarea
      bind:value={note}
      rows="25"
      class="w-full p-4 pr-28 border rounded bg-gray-50"
    ></textarea>
    <div
      class="flex items-center bg-gray-100 rounded-lg p-3 space-x-4 shadow-md"
    >
      <Button type="submit" class="relative" on:click={upload}>
        Upload SOAP Note
      </Button>

      <div class="flex flex-col items-center">
        <div class="text-xs text-gray-700 mb-1">Download PDF</div>
        <label class="switch">
          <input type="checkbox" bind:checked={googleDocsEnabled} />
          <span class="slider"></span>
        </label>
      </div>
    </div>
    {#if isUploading}
      <div
        class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
        ></div>
      </div>
    {/if}
  </div>
</div>
