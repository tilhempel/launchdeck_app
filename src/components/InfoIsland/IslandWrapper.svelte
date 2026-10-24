<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly, fade } from 'svelte/transition';
	import { islands } from './InfoHandler.svelte';
	import IslandItem from './Island.svelte';

	const reduceMotion =
		typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	const d = reduceMotion ? 0 : 1;
</script>

<div class="host" aria-live="polite">
	{#each islands.items as island (island.id)}
		<div
			class="slot"
			animate:flip={{ duration: 200 * d }}
			in:fly={{ y: -24, duration: 250 * d }}
			out:fade={{ duration: 150 * d }}
		>
			<IslandItem {island} />
		</div>
	{/each}
</div>

<style>
	.host {
		position: fixed;
		top: max(0.75rem, env(safe-area-inset-top));
		left: 0;
		right: 0;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		pointer-events: none; /* only the islands themselves are clickable */
	}
</style>