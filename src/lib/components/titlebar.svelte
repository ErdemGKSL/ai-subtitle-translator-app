<script>

  import { Maximize, Minus, X } from "lucide-svelte";

</script>
<div class="w-full bg-sidebar/80 h-10 flex flex-row justify-between items-center pl-4 drag">
  <!-- svelte-ignore element_invalid_self_closing_tag -->
  <span class="h-10" />
  <span class="text-accent">
    AI Translator App by ErdemGKSL
  </span>
  <div class="flex flex-row no-drag h-full">
    <button class="hover:bg-black/50 h-full px-3 text-white" onclick={() => {
      window.app.send("minimize");
    }}>
      <Minus class="size-5" />
    </button>
    <!-- <button class="hover:bg-black/50 h-full px-3" onclick={() => {
      window.app.send("maximize");
    }}>
      <Maximize class="size-5" />
    </button> -->
    <button class="hover:bg-red-600/60 text-white h-full px-3" onclick={() => {
      window.app.send("close");
    }}>
      <X class="size-5" />
    </button>
  </div>
</div>

<style>
	.drag {
		-webkit-app-region: drag;
	}

	.no-drag {
		-webkit-app-region: no-drag;
	}
</style>