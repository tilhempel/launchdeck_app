<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";

  import ActionButton from "../components/ActionButton.svelte";
  import SinkSlider from "../components/VolumeControls/SinkSlider.svelte";
  import MuteSink from "../components/VolumeControls/MuteSink.svelte";
  import ChangeVolume from "../components/VolumeControls/ChangeVolume.svelte";
  import { setContext } from "svelte";
  import { ws, type WSEventMap } from "../util/websocketServer";
</script>




<main class="container">
  <div class="buttonGrid">
    <ActionButton onclick={ws.reconnect}>
      <i class="fa-solid fa-arrow-rotate-right"></i>
      <span>Reconnect</span>
    </ActionButton>
    <ChangeVolume isDefaultDevice value={5} />
    <ChangeVolume isDefaultDevice value={-5} />
    <MuteSink isDefaultDevice/>
    <SinkSlider isDefaultDevice deviceType="Sink" />
    <SinkSlider isDefaultDevice deviceType="Source" />
  </div>
</main>

<style>

.buttonGrid {
  display: grid;
  grid-template-columns: 100px 100px 100px 100px;
  gap: 10px;
}

:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  margin: 0;
  padding-top: 10vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.row {
  display: flex;
  justify-content: center;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

h1 {
  text-align: center;
}

input,
button {
  outline: none;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #2f2f2f;
  }

  a:hover {
    color: #24c8db;
  }

  input,
  button {
    color: #ffffff;
    background-color: #0f0f0f98;
  }
  button:active {
    background-color: #0f0f0f69;
  }
}

</style>
