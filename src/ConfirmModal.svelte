
<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div class="bg-white rounded-lg p-6 shadow-lg max-w-xs w-full text-center">
    <p class="text-lg font-semibold mb-4">{message}</p>
    <div class="flex justify-center gap-4">
      <button
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        on:click={onConfirm}
      >
        Yes, Delete
      </button>
      <button
        class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
        on:click={onCancel}
      >
        Cancel
      </button>
    </div>
  </div>
</div>

<script>
  export let message = "Are you sure?";
  export let onConfirm;
  export let onCancel;
</script>
