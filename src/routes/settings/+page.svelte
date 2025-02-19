<script lang="ts">
  import { state } from "$lib/data.svelte";
</script>

<div class="p-4 max-w-md mx-auto bg-sidebar text-white rounded shadow">
  <label for="openaiKey" class="block text-sm font-medium mb-1">OpenAI Key:</label>
  <input
    id="openaiKey"
    type="text"
    bind:value={state.openaiKey}
    class="mt-1 block w-full px-3 py-2 bg-background border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-primary"
  />
</div>