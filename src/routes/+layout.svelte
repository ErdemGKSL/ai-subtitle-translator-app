<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/sidebar.svelte';
  import Titlebar from '$lib/components/titlebar.svelte';
  import { onMount } from 'svelte';
  import { state } from '$lib/data.svelte';
  import { browser } from '$app/environment';
  import { getTranslationKeys, translationPrefix } from '$lib';
  import { on, send, sendWait } from '$lib/app';
	import _ from 'lodash';

	let { children } = $props();

	onMount(() => {
		if (!browser) return;
		let translationKeys = getTranslationKeys();
		state.translations = translationKeys.map((k) => JSON.parse(localStorage.getItem(translationPrefix + k) || 'false')).filter((t) => t);
		state.openaiKey = localStorage.getItem('openaiKey') || '';

		send("setOpenAIKey", state.openaiKey);

		// on("chromaDataAdded", (dbName, df, dt) => {
		// 	console.log("ADD", dbName, df, dt);
		// 	const data = {
		// 		from: df,
		// 		to: dt
		// 	}
		// 	let db = state.keywordDatabase[dbName];
		// 	if (!db) {
		// 		db = []
		// 		state.keywordDatabase[dbName] = db;
		// 	}
		// 	db.push(data);
		// });

		(async () => {
			for (let i = 0; i < state.translations.length; i++) {
				let translation = state.translations[i];
				let db = state.keywordDatabase[translation.keywordDB];
				if (!db) {
					let [cDb] = await sendWait("getChromaData", translation.keywordDB);
					console.log(cDb);
					db = cDb;
					state.keywordDatabase[translation.keywordDB] = db;
				}
			}
		})();

		// let i = setInterval(() => {
		// 	console.log(state);
		// }, 10000)

		// return () => clearInterval(i);

		let interval = setInterval(() => {
			saveTranslations();
		}, 15000);

		return () => clearInterval(interval);
	})

	$effect(() => {
		if (!browser) return;
		localStorage.setItem('openaiKey', state.openaiKey.trim());
		send("setOpenAIKey", state.openaiKey.trim());
	});

	// $effect(() => {
	// 	state.translations;
	// 	if (!browser) return;
	// 	saveTranslationsDebounced();
	// });

	// let saveTranslationsDebounced = _.throttle(saveTranslations, 5000);

	

	function saveTranslations() {
		console.log("Saving translations");
		for (let i = 0; i < state.translations.length; i++) {
			let translation = state.translations[i];
			localStorage
				.setItem(`${translationPrefix}${translation.id}`, JSON.stringify(translation));
		}
	}

</script>

<div class="flex w-screen h-screen text-primary bg-background rounded-lg overflow-hidden">
	<Sidebar />
	<div class="w-[calc(100%-16rem)] flex h-full flex-col">
		<Titlebar />
		<div class="flex p-4 items-start justify-start">
			{@render children()}
		</div>
	</div>
</div>