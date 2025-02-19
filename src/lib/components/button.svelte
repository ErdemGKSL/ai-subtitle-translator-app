<script lang="ts">
	// export let type = "button";
	// export let variant = "primary";
	// export let className = "";
	
	const variantClasses = {
		primary: "bg-primary text-white hover:bg-primary/80 focus:ring-primary",
		secondary: "bg-secondary text-white hover:bg-secondary/80 focus:ring-secondary",
		accent: "bg-accent text-white hover:bg-accent/80 focus:ring-accent",
		danger: "bg-red-600 text-white hover:bg-red-800 focus:ring-red-600"
	};

  let { variant = "primary", class: className = "", children, ...restProps }: {
		type?: "button" | "submit" | "reset",
		variant?: "primary" | "secondary" | "accent" | "danger",
		class?: string,
		children?: any,
		onclick?: (e: MouseEvent) => void
	} = $props();
</script>

<button {...restProps} class={`font-semibold py-2 px-4 cursor-pointer rounded transition duration-200 ease-in-out focus:outline-none focus:ring-2 ${variantClasses[variant] || variantClasses.primary} ${className}`}>
  {@render children?.()}
</button>
