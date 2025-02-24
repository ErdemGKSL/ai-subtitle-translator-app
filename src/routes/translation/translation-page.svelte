<script lang="ts">
  import { sendWait } from "$lib/app";
  import Button from "$lib/components/button.svelte";
  import Input from "$lib/components/input.svelte";
  import { state as data, type Translation } from "$lib/data.svelte";

  let {
    translation = $bindable()
   }: {
    translation: Translation
  } = $props();

</script>

<div class="flex flex-col w-full min-h-full gap-8">
  <div class="flex flex-col justify-center items-center">
    <h1 class="text-2xl font-bold bg-sidebar/50 p-2 rounded-t-lg w-max">
      Main Settings
    </h1>
    <div class="flex flex-row w-max bg-sidebar/50 rounded-md gap-4 p-4 flex-wrap max-w-[52rem] items-center justify-center">
      <div class="flex flex-row justify-center items-center gap-2 w-[50rem]">
        <p>Name: </p>
        <Input bind:value={translation.name} placeholder="Name" type="text" />
      </div>
      <div class="flex flex-row justify-center items-center gap-2">
        <p>Source Language: </p>
        <Input bind:value={translation.language} placeholder="Source Language" type="text" />
      </div>
      <div class="flex flex-row justify-center items-center gap-2">
        <p>Target Language: </p>
        <Input bind:value={translation.targetLanguage} placeholder="Target Language" type="text" />
      </div>
    </div>
  </div>
  <div class="flex flex-col justify-center items-center">
    <h1 class="text-2xl font-bold bg-sidebar/50 p-2 rounded-t-lg w-max relative flex">
    <!-- <h1 class="flex text-2xl font-bold bg-sidebar/50 p-2 rounded-t-lg relative"> -->

      Translation Lines {translation.translateLines.map(a => a.translation).filter(a => a?.length).length}/{translation.translateLines.length}
      <div class="flex absolute left-[-1rem] gap-2 w-4 flex-row-reverse">
        <Button class="!p-1 !text-sm m-[0.25rem]" onclick={async (e) => {
          let elm = e.target as HTMLButtonElement;
          elm.disabled = true;
          let currentTranslation = data.translations.find((t) => t.id == translation.id);

          let translationState = data.current.translating.has(translation.id);
          if (translationState) return;
          data.current.translating.add(translation.id);

          let lines = currentTranslation.translateLines;

          for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            let currentTranslation = line.translation
            if (!currentTranslation?.length) {
              let previousLines = Array.from({ length: 3 }, (_, ii) => lines[i - (ii + 1)]?.translation).filter(a => a?.length).map(a => `- """${a.trim()}"""`).reverse().join("\n");
              console.log(previousLines);
              // databaseName, sourceLang, targetLang, text
              let [data] = await sendWait("translate", 
                translation.keywordDB, 
                translation.language, 
                translation.targetLanguage, 
                line.content,
                previousLines
              );
              if (data) line.translation = data;
              else {
                console.log("Error translating line", line);
              }
              await new Promise((r) => setTimeout(r, 1500));
            }
          }

        }}>
          Translate
        </Button>
      </div>
      <div class="flex absolute right-[-1rem] gap-2 w-4 flex-row">
        <Button class="!p-1 !text-sm m-[0.25rem]" onclick={async (e) => {
          let text = translation.translateLines
            .filter(a => a?.translation?.length)
            .map((a, i) => `${i}\n${a.time}\n${a.translation}`)
            .join("\n\n");

          const blob = new Blob([text], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const aTag = document.createElement('a');
          aTag.href = url;
          aTag.download = `${translation.name || 'translation'}_${Date.now()}.srt`;
          document.body.appendChild(aTag);
          aTag.click();
          document.body.removeChild(aTag);
          window.URL.revokeObjectURL(url);
        }}>
          Download
        </Button>
      </div>
    </h1>
    <div class="no-scrollbar relative flex flex-col bg-sidebar/40 rounded-md gap-4 p-4 max-w-[52rem] items-center h-[27rem] overflow-auto">
      {#each translation.translateLines as line, i (i)}
        <div class="flex flex-col gap-4 w-full justify-center items-center bg-black/10 rounded-lg py-4">
          <div class="px-2 flex flex-row justify-center items-center gap-2 max-w-[90%] bg-black/10 rounded-md">
            <p>Time: </p>
            <p>{line.time}</p>
          </div>
          <div class="px-2 flex flex-row justify-center items-center gap-2 max-w-[90%] bg-black/10 rounded-md">
            <p>Content: </p>
            <p class="max-w-full whitespace-normal">{line.content}</p>
          </div>
          <div class="px-2 flex flex-row justify-center items-center gap-2 w-[90%] bg-black/10 rounded-md">
            <p>Translation: </p>
            <Input class="!w-[85%]" bind:value={line.translation} placeholder="Translation" type="text" />
          </div>
        </div>
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