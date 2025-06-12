<script>
  import { Button } from 'flowbite-svelte';

  export let note = '';
  export let isUploading = false;
  export let onCopy = () => {};
</script>

<div class="mt-8">
  <h2 class="text-xl font-bold mb-4">Generated SOAP Note</h2>
  <div class="relative">
    <div class="absolute right-2 top-2">
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
      readonly 
      value={note} 
      rows="8" 
      class="w-full p-4 pr-28 border rounded bg-gray-50"
    ></textarea>
    {#if isUploading}
      <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    {/if}
  </div>
</div>
