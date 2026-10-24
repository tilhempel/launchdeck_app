<script lang="ts">
	import { slide } from 'svelte/transition';
	import { islands, type Island } from './InfoHandler.svelte';

	let { island }: { island: Island } = $props();

	const timed = Number.isFinite(island.duration) && island.duration > 0;
	const detailsId = `island-details-${island.id}`;

	let hovered = $state(false);
	let expanded = $state(false);
	let copied = $state(false);

	// Hovering, focusing or reading the details freezes this island's countdown.
	const paused = $derived(hovered || expanded);

	let remaining = island.duration;
	let startedAt = 0;
	let timer: ReturnType<typeof setTimeout> | undefined;

	function start() {
		if (!timed) return;
		startedAt = Date.now();
		timer = setTimeout(() => islands.dismiss(island.id), remaining);
	}

	function stop() {
		if (timer === undefined) return;
		clearTimeout(timer);
		timer = undefined;
		remaining -= Date.now() - startedAt;
	}

	// Every island runs its own timer. It runs while not paused and is cleaned up on destroy.
	$effect(() => {
		if (!paused) {
			start();
			return stop;
		}
	});

	async function copy() {
		if (!island.details) return;
		try {
			await navigator.clipboard.writeText(island.details);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			/* clipboard unavailable; ignore */
		}
	}
</script>

<div
	class="island {island.kind}"
	role={island.kind === 'error' ? 'alert' : 'status'}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	onfocusin={() => (hovered = true)}
	onfocusout={() => (hovered = false)}
>
	<div class="row">
		<span class="dot" aria-hidden="true"></span>
		<p class="message">{island.message}</p>

		{#if island.details}
			<button
				class="btn toggle"
				aria-expanded={expanded}
				aria-controls={detailsId}
				onclick={() => (expanded = !expanded)}
			>
				Details
				<svg class="chevron" class:open={expanded} viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
					<path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
		{/if}

		<button class="btn close" aria-label="Dismiss" onclick={() => islands.dismiss(island.id)}>
			<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
				<path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
		</button>
	</div>

	{#if island.details && expanded}
		<div class="details" id={detailsId} transition:slide={{ duration: 180 }}>
			<button class="btn copy" onclick={copy}>{copied ? 'Copied' : 'Copy'}</button>
			<pre>{island.details}</pre>
		</div>
	{/if}

	{#if timed}
		<span
			class="countdown"
			class:paused
			style:animation-duration="{island.duration}ms"
			aria-hidden="true"
		></span>
	{/if}
</div>

<style>
	.island {
		--accent: #6ea8fe;
		position: relative;
		display: flex;
		flex-direction: column;
		min-width: min(50vw, 25rem);
		width: fit-content;
		max-width: min(50rem, calc(100vw - 2rem));
		border-radius: 0.5rem;
		background: #0f0f0f;
		color: #f2f2f3;
		overflow: hidden;
		pointer-events: auto;
		font: 500 0.875rem/1.3 system-ui, sans-serif;
	}

	.island.warning {
		--accent: #ffc247;
	}

	.island.error {
		--accent: #ff6b6b;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.65rem 0.75rem 0.65rem 1rem;
	}

	.dot {
		flex: none;
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 10px var(--accent);
	}

	.message {
		margin: 0;
		flex: 1;
		overflow-wrap: anywhere;
	}

	.btn {
		flex: none;
		border: 0;
		background: transparent;
		color: #9a9aa2;
		cursor: pointer;
		font: inherit;
	}

	.btn:hover {
		color: #fff;
	}

	.btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}

	.close {
		display: grid;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		border-radius: 50%;
	}

	.close:hover {
		background: rgb(255 255 255 / 0.1);
	}

	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		font-size: 0.8rem;
		background: rgb(255 255 255 / 0.07);
	}

	.toggle:hover {
		background: rgb(255 255 255 / 0.14);
	}

	.chevron {
		transition: transform 0.18s ease;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.details {
		position: relative;
		margin: 0 0.75rem 0.75rem;
		border-radius: 0.75rem;
		background: #0a0a0b;
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.06);
	}

	.details pre {
		margin: 0;
		padding: 0.75rem 0.85rem;
		max-height: 14rem;
        min-height: 1.5rem;
		overflow: auto;
		font: 400 0.75rem/1.5 ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		color: #d4d4d8;
		white-space: pre;
	}

	.copy {
		position: absolute;
		top: 0.4rem;
		right: 0.5rem;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		font-size: 0.7rem;
		background: #1c1c20;
        opacity: 0.6;
        transition: 200ms;
	}
    .copy:hover {
        opacity: 1;
    }

	.countdown {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 2px;
		width: 100%;
		background: var(--accent);
		transform-origin: left;
		animation-name: drain;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}

	.countdown.paused {
		animation-play-state: paused;
	}

	@keyframes drain {
		to {
			transform: scaleX(0);
		}
	}
</style>