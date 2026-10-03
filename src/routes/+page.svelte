<script lang="ts">

  import ActionButton from "../components/ActionButton.svelte";
  import VolumeSlider from "../components/VolumeControls/VolumeSlider.svelte";
  import MuteButton from "../components/VolumeControls/MuteButton.svelte";
  import ChangeVolume from "../components/VolumeControls/ChangeVolume.svelte";
  import { ws } from "../util/websocketServer";
  import Grid from "../pages/Grid.svelte";
  import GridElement from "../pages/GridElement.svelte";
  import type { Application } from "../types/Volume";
  import { Applications } from "../util/stateStore";

  let apps: Map<number, Application> | null = $state(null)

  Applications.subscribeToList((val) => {
    apps = val
  });

</script>

<main class="container">
  <Grid rows={5} columns={5} >
    <GridElement row={1} column={1}>
      <ActionButton onclick={ws.reconnect}>
        <i class="fa-solid fa-arrow-rotate-right"></i>
        <span>Reconnect</span>
      </ActionButton>
    </GridElement>
    <GridElement row={2} column={2}>
      <ChangeVolume isDefaultDevice value={5} />
    </GridElement>
    <GridElement row={3} column={3}>
      <ChangeVolume isDefaultDevice value={-5} />
    </GridElement>
    <GridElement row={4} column={4}>
      <MuteButton isDefaultDevice deviceType="Sink"/>
    </GridElement>
    <GridElement row={2} column={1} rowSpan={2}>
      <VolumeSlider isDefaultDevice deviceType="Sink" vertical/>
    </GridElement>
    <GridElement row={1} column={2} columnSpan={2}>
      <VolumeSlider isDefaultDevice deviceType="Sink"/>
    </GridElement>
    <GridElement row={5} column={1} columnSpan={2}>
    {#if apps != null}
      {#each apps.values() as app}
        <VolumeSlider deviceType="Application" target={app.id} />
      {/each}
    {/if}
    </GridElement>
  </Grid>
</main>

<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  --bg-color-light: #f6f6f6;
  --color-light: #0f0f0f;
  --bg-color-dark: #2f2f2f;
  --color-dark: #f6f6f6;
  --color-level-dark: #0f0f0f98;
  --accent: #e66100;

  color: var(--color-light);
  background-color: var(--bg-color-light);

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  height: 100vh;
  width: 100vw;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: var(--color-dark);
    background-color: var(--bg-color-dark);
  }
}

</style>
