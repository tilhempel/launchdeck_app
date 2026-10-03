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
        onLabelClick?: Function
    }
    let {min, max, step=1, vertical=false, steps, highlight = "#ccc", danger = "red", onUpdate, showValue = false, showIcon = false, children = null, value = 0, onLabelClick}: props = $props();

    let slider: HTMLInputElement;
    let trackColor = 'orange'

    function update() {
        if (steps == undefined || steps.length <1) return;

        value = +slider.value;
        let perc = (value-(+min)) / (+max-(+min)) * 100;
        let cutoff = (+steps[steps.length-2] -(+min)) / (+max-(+min)) * 100

        
        let stops;
        if (value <= 100) {
            stops = [
                highlight + ' 0%',
                highlight + ' ' + perc + '%',
                trackColor + ' ' + perc + '%',
                trackColor + ' 100%'
            ];
        } else {
            stops = [
                highlight + ' 0%',
                highlight + ' ' + cutoff + '%',   // close out highlight here
                danger + ' ' + cutoff + '%',      // then start danger, same position
                danger + ' ' + perc + '%',
                trackColor + ' ' + perc + '%',
                trackColor + ' 100%'
            ];
        }
        const direction = 'to right';
        slider.style.background = 'linear-gradient(' + direction + ', ' + stops.join(', ') + ')';
    }

    let container: HTMLDivElement;
    let sliderLength = $state(0);

    $effect(() => {
        const styles = getComputedStyle(document.documentElement)

        highlight = styles.getPropertyValue("--accent").trim()
        trackColor = styles.getPropertyValue("--color-level-dark").trim()



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
            <button class="descriptionWrapper {vertical ? 'vertical' : ''} {onLabelClick != undefined ? 'labelButton': ''}" onclick={() => {if (onLabelClick != undefined) {onLabelClick()}}} style="{showValue ? 'padding-top: 3px;' : ''}">
                {#if showValue}
                    <span>{value}</span>
                {/if}
                {#if showIcon} 
                    {@render children()}
                {/if}
            </button>
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
    height: 25px;
    justify-content: space-between;
}
.interimWrapper.vertical {
    position: absolute;
    width: 100%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
}

.descriptionWrapper {
    all: unset;
    align-self: stretch;   /* same height as the row, so its center == the slider's center */
    width: 5%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    box-sizing: border-box;
}

.descriptionWrapper.labelButton {
    cursor: pointer;
}

.descriptionWrapper.vertical {
    transform: rotate(90deg);
    padding-right: 1px;
}

.SliderInput {
    -webkit-appearance: none;
    appearance: none;
    border-radius: 3px;
    background: linear-gradient(to right, #1D9E75 0%, #1D9E75 66.67%, #D85A30 66.67%, #D85A30 100%);
    outline: none;
    cursor: pointer;
    width: 93.5%;
    height: 15px;
    margin: 0;
}

.SliderInput::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  background: var(--color-dark);
  cursor: pointer;
  border-radius: 15px;
}

.SliderInput::-moz-range-thumb {
  width: 25px;
  height: 25px;
  background: var(--color-dark);
  box-shadow: none;
  cursor: pointer;
  border-radius: 15px;
}
</style>