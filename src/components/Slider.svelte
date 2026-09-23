<script lang="ts">
    import { onMount } from "svelte";

    interface props {
        min: number | string,
        max: number | string,
        step: number | string | null,
        vertical?: Boolean,
        steps?: string[],
        highlight?: string | null,
        danger?: string | null
        onUpdate: Function
        showValue?: boolean
        showIcon?: boolean
        children?: any
        value?: number
    }
    let {min, max, step=1, vertical=false, steps, highlight = "#ccc", danger = "#00F", onUpdate, showValue = false, showIcon = false, children = null, value = 0}: props = $props();

    let slider: HTMLInputElement;

    function update() {
        if (steps == undefined || steps.length <1) return;

        value = +slider.value;
        let perc = (value-(+min)) / (+max-(+min)) * 100;
        let cutoff = (+steps[steps.length-2] -(+min)) / (+max-(+min)) * 100
        const track = 'green';

        
        let stops;
        if (value <= 100) {
            stops = [
                highlight + ' 0%',
                highlight + ' ' + perc + '%',
                track + ' ' + perc + '%',
                track + ' 100%'
            ];
        } else {
            stops = [
                highlight + ' 0%',
                highlight + ' ' + cutoff + '%',   // close out highlight here
                danger + ' ' + cutoff + '%',      // then start danger, same position
                danger + ' ' + perc + '%',
                track + ' ' + perc + '%',
                track + ' 100%'
            ];
        }
        const direction = 'to right';
        slider.style.background = 'linear-gradient(' + direction + ', ' + stops.join(', ') + ')';
    }

    onMount(() => {
        update();
    })
    $effect(() => {
        update()
    })
</script>

<div class="SliderWrapper {vertical ? 'vertical' : ''}">
    <div class="interimWrapper {vertical ? 'vertical' : ''}">
        {#if showValue || showIcon}
            <div class="descriptionWrapper {vertical ? 'vertical' : ''}">
                {#if showValue}
                    <span>{value}</span>
                {/if}
                {#if showIcon} 
                    {@render children()}
                {/if}
            </div>
        {/if}
        <input type="range" bind:this={slider} value={value} onmouseup={() => onUpdate(+slider.value)} oninput={update} id="inputSlider" min={min} max={max} step={step} class="SliderInput" list="steps">
    </div>
    <datalist id=steps>
        {#each steps as s}
            <option value="{s}">{s}</option>
        {/each}
    </datalist>
</div>


<style>

.SliderWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
}

.SliderWrapper.vertical {
    width: 30px;
    height: 330px;
}

.SliderWrapper .descriptionWrapper {
    width: 30px;
    height: 30px;
}
.interimWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
}
.interimWrapper.vertical {
    flex-shrink: 0;
    transform: rotate(-90deg);
    transform-origin: center;
}

.descriptionWrapper {
    line-height: 30px;
}

.descriptionWrapper.vertical {
    transform: rotate(90deg);
}

.SliderInput {
    -webkit-appearance: none;
    appearance: none;
    border-radius: 3px;
    background: linear-gradient(to right, #1D9E75 0%, #1D9E75 66.67%, #D85A30 66.67%, #D85A30 100%);
    outline: none;
    cursor: pointer;
    width: 300px;
    height: 15px;
}

.SliderInput::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  background: #04AA6D;
  cursor: pointer;
  border-radius: 10px;
}

.SliderInput::-moz-range-thumb {
  width: 25px;
  height: 25px;
  background: #04AA6D;
  box-shadow: none;
  cursor: pointer;
  border-radius: 3px;
}
</style>