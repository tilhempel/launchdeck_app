<script lang="ts">
    import { PageManager } from "../../util/layoutHandler";
    import ActionButton from "../ActionButton.svelte";

    let { target, back } = $props()

</script>

<ActionButton onclick={() => PageManager.setActivePage(target)}>
    {#if back != undefined && back}
        <i class="fa-solid fa-turn-up" style="transform: scaleX(-1)"></i><br>
    {:else}
        <i class="fa-solid fa-folder"></i><br>
    {/if}
</ActionButton>