<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { state } from '$lib/data.svelte';


  let { children } = $props();

  let id = $derived(page.url.searchParams.get("id") ?? "-1")
  let translation = $derived(state.translations.find((t) => t.id == id));
  let type = $derived(page.url.searchParams.get("type") ?? "data");
</script>

{#if translation}
  <div class="flex flex-col w-full h-full items-center gap-2 overflow-hidden">
    <div class="flex-row flex w-[90%] justify-between rounded-lg overflow-hidden bg-sidebar">
      {@render navigation("Data", "data")}
      {@render navigation("Translation", "text")}
      <!-- {@render navigation("Outputs", "output")} -->
    </div>
    <div class="flex w-full flex-col p-4">
      {@render children()}
    </div>
  </div>
{:else}
  <div class="flex-1 p-4 items-start justify-start">
    <h1 class="text-2xl font-bold">No translation found</h1>
  </div>
{/if}

{#snippet navigation(content: string, target: string)}
  <button onclick={() => {
    goto(`?id=${id}&type=${target}`);
  }} class="hover:bg-black/30 w-full text-center {type == target ? '!bg-black/50' : ''}">
    {content}
  </button>
{/snippet}