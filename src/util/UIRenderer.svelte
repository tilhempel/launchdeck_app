<script lang="ts">
  import type { UIElement } from './layoutConfig';

  let { elements }: { elements: UIElement[] } = $props();
</script>

{#snippet render(items: UIElement[])}
  {#each items as el}
    {@const Comp = el.component}
    {#if el.children?.length}
      <Comp {...el.props}>
        {@render render(el.children)}
      </Comp>
    {:else}
      <Comp {...el.props} />
    {/if}
  {/each}
{/snippet}

{@render render(elements)}