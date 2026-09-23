<script lang="ts">

    interface props {
        row: number,
        column: number,
        rowSpan?: number,
        columnSpan?: number
        children: any
    }

    let {row, column, rowSpan = 1, columnSpan = 1, children}: props = $props()
</script>

<div class="gridElement" style={`
        grid-row: ${row} / span ${rowSpan};
        grid-column: ${column} / span ${columnSpan};
        flex-direction: ${rowSpan > column ? "row" : "column"}
    `}>
    {@render children()}
</div>

<style>
    .gridElement {
        width: 100%;
        height: 100%;
        padding: 15px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
    }
</style>