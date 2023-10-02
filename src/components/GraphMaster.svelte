<script>
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { activeGraphTab } from "../store.js";
  import GraphTabs from "./GraphTabs.svelte";

  $: showGraphDetails = $activeGraphTab >= 0 ? true : false;

  //---------------------------------------------------------------------
  // ----- ADD NEW GRAPHS BELOW
  import Actigram from "../charts/Actigram.svelte";
  import ActigramControls from "../charts/Actigram_controls.svelte";
  // ----- ALSO ADD TO THE BBOTTOM
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
        <Actigram />
      </GraphTabs>
    </Pane>
    <Pane size={25}>
      {#if showGraphDetails}
        <ActigramControls />
      {/if}
    </Pane>
  </Splitpanes>
</Pane>
