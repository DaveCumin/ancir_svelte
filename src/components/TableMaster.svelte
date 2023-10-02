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
        <div>Data: {$data[$dataIDsforTables[$activeTableTab]].displayName}</div>
        <div>
          Imported: {$data[$dataIDsforTables[$activeTableTab]].importedFrom}
        </div>
      </Pane>
    {/if}
  </Splitpanes>
</Pane>
