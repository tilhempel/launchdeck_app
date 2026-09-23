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

    let container: HTMLDivElement;
    let sliderLength = $state(0);

    $effect(() => {
        if (!vertical) return
        const observer = new ResizeObserver(([entry]) => {
            sliderLength = entry.contentRect.height;
        });

        observer.observe(container);

        return () => observer.disconnect();
    });

    onMount(() => {
        update();
    })
    $effect(() => {
        update()
    })
</script>

<div class="SliderWrapper {vertical ? 'vertical' : ''}" bind:this={container}>
    <div class="interimWrapper {vertical ? 'vertical' : ''}" style={`width: ${vertical ? (sliderLength + "px") : "100%"}`}>
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
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.SliderWrapper.vertical {
    position: relative;
}

.interimWrapper {
    display: flex;
    align-items: center;
}
.interimWrapper.vertical {
    position: absolute;
    width: 100%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
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
    writing-mode: vertical-lr;
    outline: none;
    cursor: pointer;
    width: 100%;
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