<script lang="ts">
  import { send, sendWait } from "$lib/app";
  import Button from "$lib/components/button.svelte";
  import Input from "$lib/components/input.svelte";
  import { state as data, type Translation } from "$lib/data.svelte";
  import _ from "lodash";
  import { ArrowBigDown, Trash } from "lucide-svelte";



  let {
    translation = $bindable()
   }: {
    translation: Translation
  } = $props();

  let databaseName = $state(translation.keywordDB);
  let keywords = $derived(data.keywordDatabase[databaseName] ?? []);

  async function load() {
    if (!data.keywordDatabase[databaseName]) {
      let [data] = await sendWait("getChromaData", databaseName);
      data.keywordDatabase[databaseName] = data;
      console.log(data);
    }
  }

  let debouncedLoad = _.debounce(load, 500);

  $effect(() => {
    translation.keywordDB = databaseName;
    debouncedLoad();
  })

</script>

<div class="flex w-full overflow-hidden max-h-full flex-col gap-4 ">
  <div class="flex h-12 flex-row items-center gap-2">
    <p class="whitespace-nowrap">
      Data Location:
    </p>
    <Input bind:value={databaseName} placeholder="Database name" type="text"  />
  </div>

  <div class="flex flex-col w-full items-center relative">
    
    <h1 class="flex text-2xl font-bold bg-sidebar/50 p-2 rounded-t-lg relative">
      Pending Keywords
      <div class="flex absolute right-[-1rem] gap-2 w-4">
        <Button class="!p-1 !text-sm m-[0.25rem]" onclick={async (e) => {
          let elm = e.target as HTMLButtonElement;
          elm.disabled = true;
          let currentDatabaseName = structuredClone(databaseName);
          let currentTranslation = data.translations.find((t) => t.id == translation.id);
          let currentKeywords = data.keywordDatabase[currentDatabaseName];

          let searchState = data.current.searching.has(currentDatabaseName);
          if (searchState) return;
          data.current.searching.add(currentDatabaseName);

          let [newKeywords] = await sendWait("findKeywords", currentTranslation.translateLines.map((l, i) => `${i}\n${l.time}\n${l.content}`).join("\n\n")) as [string[]];
          console.log(newKeywords);

          for (let i = 0; i < newKeywords.length; i++) {
            let keyword = newKeywords[i];
            if (currentTranslation.pendingKeywords.find((k) => k.from == keyword)) continue;
            if (currentKeywords.find((k) => k.from == keyword)) continue;

            currentTranslation.pendingKeywords.push({ from: keyword, to: "" });
          }

          data.current.searching.delete(currentDatabaseName);
          elm.disabled = false;
        }}>
          Search
        </Button>
      </div>
    </h1>
    <div class="no-scrollbar gap-2 flex flex-row w-[54.1rem] h-64 bg-sidebar/50 rounded-lg p-4 px-6 flex-wrap overflow-y-auto ">
      {#each translation.pendingKeywords as keyword (keyword.from)}
        <form class="flex flex-col items-center gap-2 p-2 bg-sidebar/75 h-min text-secondary relative group" onsubmit={async (e) => {
          e.preventDefault();
          let elm = e.target as HTMLFormElement;

          let target = keyword.to.trim();
          let currentTranslation = data.translations.find((t) => t.id == translation.id);
          let currentKeywords = data.keywordDatabase[databaseName];
          console.log(1)
          if (!target.length) {
            console.log(
              target.length,
              target
            )
            currentTranslation.pendingKeywords.splice(translation.pendingKeywords.indexOf(keyword), 1);
            return;
          }
          console.log(2)
          if (elm.dataset.disabled == "true") return;
          console.log(3)
          elm.dataset.disabled = "true";
          if (!currentKeywords) {
            currentKeywords = [];
            data.keywordDatabase[databaseName] = currentKeywords;
          }
          let success = await sendWait("addChromaData", databaseName, keyword.from, target);
          if (success) {
            console.log("success");
            currentTranslation.pendingKeywords.splice(translation.pendingKeywords.indexOf(keyword), 1);
            currentKeywords.push(keyword);
          }
          console.log(4)
          elm.dataset.disabled = "false";
        }}>
          <p class="whitespace-nowrap">From: {keyword.from}</p>
          <Input bind:value={keyword.to} type="text" placeholder="To" />
          <Button type="button" variant="danger" class="opacity-0 hover:opacity-100 group-hover:opacity-100 absolute right-[-1rem] top-[-1rem] size-8 !text-sm m-[0.25rem] flex justify-center items-center z-50" onclick={() => {
            let currentTranslation = data.translations.find((t) => t.id == translation.id);
            let index = currentTranslation.pendingKeywords.indexOf(keyword);
            if (index == -1) return;
            currentTranslation.pendingKeywords.splice(index, 1);
          }}>
            <div>
              <Trash/>
            </div>
          </Button>
        </form>
      {:else}
        <p class="text-center w-full">No data found</p>
      {/each}
    </div>
  </div>

  <div class="flex flex-col w-full items-center select-none">
    <h1 class="flex text-2xl font-bold bg-sidebar/50 p-2 rounded-t-lg">Existing Keywords</h1>
    <div class="no-scrollbar gap-2 flex flex-row w-full h-64 bg-sidebar/50 rounded-lg p-4 px-6 flex-wrap overflow-y-auto ">
      {#each keywords as keyword}
        <div class="group flex flex-col items-center gap-2 p-2 bg-sidebar/75 h-min text-secondary relative">
          <p title={keyword.from} class="w-20 overflow-hidden text-center whitespace-nowrap text-ellipsis">{keyword.from}</p>
          <span><ArrowBigDown/></span>
          <p title={keyword.to} class="w-20 overflow-hidden text-center whitespace-nowrap text-ellipsis">{keyword.to}</p>
          <Button variant="danger" class="opacity-0 hover:opacity-100 group-hover:opacity-100 absolute right-[-1rem] top-[-1rem] size-8 !text-sm m-[0.25rem] flex justify-center items-center z-50" onclick={() => {
            let currentKeywords = data.keywordDatabase[databaseName];

            let index = currentKeywords.indexOf(keyword);
            send("deleteChromaData", databaseName, keyword.from);
            if (index == -1) return;
            currentKeywords.splice(index, 1);
          }}>
            <div>
              <Trash/>
            </div>
          </Button>
        </div>
      {:else}
        <p class="text-center w-full">No data found</p>
      {/each}
    </div>
  </div>
</div>

<style>
  .no-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
</style>