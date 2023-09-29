<script>
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { dataIDsforTables, activeTableTab, data } from "../store.js";
  import TableTabs from "./TableTabs.svelte";

  $: showTableDetails = $activeTableTab >= 0 ? true : false;
</script>

<Pane>
  <Splitpanes
    style="height: 100%"
    pushOtherPanes={false}
    dblClickSplitter={false}
  >
    <Pane>
      <TableTabs />
    </Pane>
    {#if showTableDetails}
      <Pane size={30}>
        {$data[$dataIDsforTables[$activeTableTab]].displayName}
      </Pane>
    {/if}
  </Splitpanes>
</Pane>
