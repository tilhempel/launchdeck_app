<script lang="ts">
    
    interface props {
        rows: number,
        columns: number,
        children: any
    }

    let {rows = 3, columns = 3, children}: props = $props()
</script>

<div class="grid" style={`
        grid-template-columns: repeat(${columns}, 1fr);
        grid-template-rows: repeat(${rows}, 1fr);
    `}>
    {@render children()}
</div>

<style>
    .grid {
        display: grid;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
</style>