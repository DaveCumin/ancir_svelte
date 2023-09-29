<script>
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { activeGraphTab } from "../store.js";
  import GraphTabs from "./GraphTabs.svelte";
  import GraphDetails from "./GraphDetails.svelte";
  $: showGraphDetails = $activeGraphTab >= 0 ? true : false;
</script>

<Pane size={80}>
  <Splitpanes
    style="height: 100%"
    pushOtherPanes={false}
    dblClickSplitter={false}
  >
    <Pane>
      <GraphTabs />
    </Pane>
    {#if showGraphDetails}
      <Pane size={30}>
        <GraphDetails />
      </Pane>
    {/if}
  </Splitpanes>
</Pane>
