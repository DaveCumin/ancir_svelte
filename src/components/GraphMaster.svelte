<script>
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { activeGraphTab, graphs } from "../store.js";
  import GraphTabs from "./GraphTabs.svelte";

  //---------------------------------------------------------------------
  // ----- ADD NEW GRAPHS BELOW
  import Actigram from "../charts/Actigram/Actigram.svelte";
  import ActigramControls from "../charts/Actigram/Actigram_controls.svelte";

  import Raw from "../charts/Raw/Raw.svelte";
  import RawControls from "../charts/Raw/Raw_controls.svelte";

  export const graphMap = {
    actigram: { graph: Actigram, controls: ActigramControls },
    raw: { graph: Raw, controls: RawControls },
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
      <div style="margin:1em;">
        <GraphTabs />
      </div>
      <div>
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
        <svelte:component
          this={graphMap[$graphs[$activeGraphTab].graph].controls}
        />
      {:else}
        {JSON.stringify($graphs[$activeGraphTab].sourceData)}
      {/if}
    </Pane>
  </Splitpanes>
</Pane>
