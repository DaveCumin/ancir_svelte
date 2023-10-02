<script>
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { activeGraphTab, graphs } from "../store.js";
  import GraphTabs from "./GraphTabs.svelte";

  $: showGraphDetails = $activeGraphTab >= 0 ? true : false;

  //---------------------------------------------------------------------
  // ----- ADD NEW GRAPHS BELOW
  import Actigram from "../charts/Actigram.svelte";
  import ActigramControls from "../charts/Actigram_controls.svelte";
  // ----- ALSO ADD TO THE BOTTOM
  //---------------------------------------------------------------------
</script>

<Pane size={80}>
  <Splitpanes
    style="height: 100%"
    pushOtherPanes={false}
    dblClickSplitter={false}
  >
    <Pane>
      <GraphTabs>
        {#if $graphs[$activeGraphTab].graph === "actigram"}
          <Actigram />
        {:else}
          {$graphs[$activeGraphTab].graph}
        {/if}
      </GraphTabs>
    </Pane>
    <Pane size={25}>
      {#if showGraphDetails && $graphs[$activeGraphTab].graph === "actigram"}
        <ActigramControls />
      {:else}
        {JSON.stringify($graphs[$activeGraphTab].sourceData)}
      {/if}
    </Pane>
  </Splitpanes>
</Pane>
