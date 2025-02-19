<script lang="ts">
  import Button from "$lib/components/button.svelte";
  import Input from "$lib/components/input.svelte";
  import { state as data, type Translation } from "$lib/data.svelte";

  let form = $state({
    name: "",
    file: {
      path: null,
      content: ""
    },
  });

  $effect(() => {
    form.file.path;
    handleFileChange();
  });

  let input: HTMLInputElement = $state(undefined);

  function handleFileChange() {
    if (input?.files?.[0] && form.file.content) {
      console.log("31")
      const file = input.files[0];
      try {
        const reader = new FileReader();
      reader.onload = () => {
        form.file.content = reader.result as string;
      };
      reader.readAsText(file);
      } catch {
        console.error("Selected file is not a text file");
        form.file.content = null;
      }
    } else {
      form.file.content = null;
    }
  }
</script>

<form class="flex justify-center items-center w-full" onsubmit={() => {
  let id = Math.random().toString(36).substring(7);
  console.log({ file: form.file.content });

  let linesString = form.file.content.split("\n");

  let lines: Translation["translateLines"] = [];

  let currentIndex = -1;
  let currentTime = "";
  let currentContent = "";

  for (let i = 0; i < linesString.length; i++) {
    let line = linesString[i];
    if (line.trim() == "") {
      lines.push({
        time: currentTime,
        content: currentContent.trim(),
        translation: null
      })
      currentIndex = -1;
      continue;
    }
    if (currentIndex == -1) {
      currentIndex = parseInt(line);
      if (currentIndex > 0) {
        currentTime = linesString[i + 1];
        currentContent = "";
        i++;
      }
    } else {
      currentContent += line + "\n";
    }
  }

  let translation: Translation = {
    id,
    name: form.name,
    translateLines: lines,
    pendingKeywords: [],
    keywords: [],
    language: "en",
    targetLanguage: "tr",
    keywordDB: form.file.path.split("/").pop().split(".")[0],
  }

  form.file.content = "";
  form.name = "";

  data.translations.push(translation);
}}>
  <div class="flex items-center justify-center flex-col gap-2">
    <h1>
      Add Translation
    </h1>
    <h2 class="w-full">
      Name
      <Input bind:value={form.name} type="text" class="w-full" required />
    </h2>
    <h2 class="w-full">
      File
      <Input bind:ref={input} type="file" bind:value={form.file.path} class="w-min flex justify-center items-center" required />
    </h2>
    <Button type="submit" variant="primary" class="mt-4">Add Translation</Button>
  </div>
</form>