<script lang="ts">
  import { page } from "$app/state";
  import { state as data } from "$lib/data.svelte";
  import DataPage from "./data-page.svelte";
  import TranslationPage from "./translation-page.svelte";


  let id = $derived(page.url.searchParams.get("id") ?? "-1")
  let translation = $derived(data.translations.find((t) => t.id == id));
  let type = $derived(page.url.searchParams.get("type") ?? "data");

  // svelte-ignore state_referenced_locally
  let translationState = $state(translation);

  $effect(() => { translationState = translation })
</script>

{#if type == "data"}
  <DataPage bind:translation={translationState} />
{:else if type == "text"}
  <TranslationPage bind:translation={translationState} />
{:else}
  <h1 class="text-2xl font-bold">No translation found</h1>
{/if}