<script lang="ts">
  import Grid from "../pages/Grid.svelte";
  import type { Application } from "../types/Volume";
  import { Applications } from "../util/stateStore";
  import { type GridConfig, type GridItem } from "../util/layoutConfig";
  import UIRenderer from "../util/UIRenderer.svelte";
  import { PageManager } from "../util/layoutHandler";

  let apps: Map<number, Application> | null = $state(null)
  let activePage: [GridConfig, GridItem[]] | null = $state(null);

  PageManager.subscribeToActivePage(page => {
    activePage = page
  });


  Applications.subscribeToList((val) => {
    apps = val
  });

</script>

<main class="container">
  {#if activePage != null}
  <Grid rows={activePage[0].rows} columns={activePage[0].columns} > 
      <UIRenderer elements={activePage[1]} />
  </Grid>
  {/if}
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
