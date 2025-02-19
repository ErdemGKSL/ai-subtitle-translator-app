<script lang="ts">
  import { page } from "$app/state";
	import { state } from "$lib/data.svelte";
	import { ChevronRight, Home, Languages, Minus, Star, Wrench } from "lucide-svelte";
</script>

{#snippet iconRender(icon: any, name: string, url: string)}
	<a href={url} class="flex *:rounded hover:bg-gray-700 items-center p-2 rounded-md {(url.startsWith("/translation") ? (page.url.toString().split(page.url.host)?.at(-1).startsWith(url)) : (page.url.toString().split(page.url.host)?.at(-1) == (url))) ? '!bg-gray-600' : ''}">
		{#if icon}
			<svelte:component this={icon} class="w-5 h-5 inline-block mr-2" />
		{/if}
		{name}
	</a>
{/snippet}

<div class="w-64 min-h-full bg-sidebar text-white p-4">
	<nav class="flex flex-col gap-4 select-none">
		{@render iconRender(Home, "Home", "/")}
		{@render iconRender(Wrench, "Settings", "/settings")}
		<div class="px-2 pt-2 text-xs uppercase text-white/80">
			<Languages class="w-4 h-4 inline-block mr-2" />
			Translations
		</div>
		<div class="flex flex-col gap-1">
			{#each state.translations as translation (translation.id)}
				{@render iconRender(ChevronRight, translation.name, `/translation?id=${translation.id}`)}
			{/each}
		</div>
	</nav>
</div>

