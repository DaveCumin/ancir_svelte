<script context="module">
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { activeGraphTab, graphs, graphTabs } from "../store.js";
  import GraphTabs from "./GraphTabs.svelte";
  import ChartMaster from "../charts/ChartMaster.svelte";
  import { get } from "svelte/store";
  //---------------------------------------------------------------------
  // ----- ADD NEW GRAPHS BELOW
  import Actigram from "../charts/Actigram/Actigram.svelte";
  import ActigramControls from "../charts/Actigram/Actigram_controls.svelte";

  import Raw from "../charts/Raw/Raw.svelte";
  import RawControls from "../charts/Raw/Raw_controls.svelte";

  export const graphMap = {
    actigram: {
      graph: Actigram,
      controls: ActigramControls,
      prototypechartvalues: { time: "time", values: "values" },
      prototypeother: { col: { hex: "#78322e", alpha: 0.5 } },
    },
    raw: {
      graph: Raw,
      controls: RawControls,
      prototypechartvalues: { x: "any", y: "any" },
      prototypeother: { col: { hex: "#78322e", alpha: 0.5 } },
    },
  };
  //---------------------------------------------------------------------
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

      <div style="margin-left: 5px;">
        {#if $graphs[$activeGraphTab].graph in graphMap}
          <svelte:component
            this={graphMap[$graphs[$activeGraphTab].graph].graph}
          />
        {:else}
          {$graphs[$activeGraphTab].graph}
        {/if}
      </div>
    </Pane>
    <Pane size={30}>
      {#if $graphs[$activeGraphTab].graph in graphMap}
        <h1>Controls</h1>
        <svelte:component
          this={graphMap[$graphs[$activeGraphTab].graph].controls}
        />

        <ChartMaster />
      {:else}
        {JSON.stringify($graphs[$activeGraphTab].sourceData)}
      {/if}
    </Pane>
  </Splitpanes>
</Pane>
