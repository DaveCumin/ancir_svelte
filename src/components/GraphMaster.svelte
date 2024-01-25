<script>
  // @ts-nocheck

  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { activeGraphTab, graphs, graphTabs } from "../store.js";
  import GraphTabs from "./GraphTabs.svelte";
  import ChartMaster from "../charts/ChartMaster.svelte";
  import { graphMap } from "../charts/allCharts.js";
</script>

<Pane size={80}>
  <Splitpanes
    theme="modern-theme"
    style="height: 100%;"
    pushOtherPanes={false}
    dblClickSplitter={false}
  >
    <Pane>
      <GraphTabs />
      <div
        id="thePlot"
        style="    height: calc(100% - 4em);
        overflow: auto;
        width: auto;"
      >
        {#if $activeGraphTab < 0}
          <!-- NOTHING -->
        {:else if $graphs[$activeGraphTab].graph in graphMap}
          <svelte:component
            this={graphMap[$graphs[$activeGraphTab].graph].graph}
          />
        {:else}
          {$graphs[$activeGraphTab].graph}
        {/if}
      </div>
    </Pane>
    <Pane size={25}>
      {#if $activeGraphTab < 0}
        <!-- NOTHING -->
      {:else if $graphs[$activeGraphTab].graph in graphMap}
        <div
          id="chartControlsTree"
          style="height: 100%; width: auto; overflow: auto;"
        >
          <div
            style="display: flex;
        min-width: 200px;"
          >
            <h1
              style="    padding: 6px 6px 0px 6px;
          font-weight: bold;
          font-size: 1.2em;
          text-decoration: underline;"
            >
              Controls
            </h1>
          </div>
          <svelte:component
            this={graphMap[$graphs[$activeGraphTab].graph].controls}
          />

          <ChartMaster />
        </div>
      {:else}
        {JSON.stringify($graphs[$activeGraphTab].sourceData)}
      {/if}
    </Pane>
  </Splitpanes>
</Pane>
