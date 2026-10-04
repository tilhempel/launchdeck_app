<script lang="ts">
    import { PageManager } from "../../util/layoutHandler";
    import ActionButton from "../ActionButton.svelte";

    let { target } = $props()

</script>

<ActionButton onclick={() => PageManager.setActivePage(target)}>
    <i class="fa-solid fa-folder"></i><br>
</ActionButton>