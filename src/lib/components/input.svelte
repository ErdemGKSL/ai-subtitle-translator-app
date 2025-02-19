<script lang="ts">
  import type { HTMLInputTypeAttribute } from "svelte/elements";

  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary/80 focus:ring-primary",
    secondary: "bg-secondary text-white hover:bg-secondary/80 focus:ring-secondary",
    accent: "bg-accent text-white hover:bg-accent/80 focus:ring-accent"
  };

  let { 
    type = "text", 
    variant = "primary", 
    value = $bindable(""),
    class: className = "",
    ref = $bindable(),
    ...restProps 
  }: {
    type?: HTMLInputTypeAttribute,
    value?: string,
    variant?: "primary" | "secondary" | "accent",
    class?: string,
    ref?: HTMLInputElement
    [key: string]: any
  } = $props();
</script>

<input
  {...restProps}
  type={type}
  bind:value={value}
  bind:this={ref}
  class={`font-semibold py-2 px-4 border-none rounded transition duration-200 ease-in-out focus:outline-none focus:ring-2 ${variantClasses[variant] || variantClasses.primary} ${className}`}
/>
