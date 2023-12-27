<script>
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { dataIDsforTables, activeTableTab, data } from "../store.js";
  import TableTabs from "./TableTabs.svelte";
  import { getGuessedFormat, forceFornat } from "../utils/time/TimeUtils.js";
  import { updateDataProcess } from "../components/ProcessStep.svelte";

  $: showTableDetails = $activeTableTab >= 0 ? true : false;
  $: currentTableData =
    $data[$data.findIndex((d) => d.id === $dataIDsforTables[$activeTableTab])];

  function updateTimeFormat(k) {
    $data[
      $data.findIndex((d) => d.id === $dataIDsforTables[$activeTableTab])
    ].data[k].timeData = forceFornat(
      currentTableData.data[k].data,
      currentTableData.data[k].timeFormat
    );
    updateDataProcess($dataIDsforTables[$activeTableTab], k);
  }

  function guessFormat(k) {
    $data[
      $data.findIndex((d) => d.id === $dataIDsforTables[$activeTableTab])
    ].data[k].timeFormat = getGuessedFormat(currentTableData.data[k].data);
    updateTimeFormat(k);
  }
</script>

<Pane>
  <Splitpanes
    theme="modern-theme"
    style="height: 100%"
    pushOtherPanes={false}
    dblClickSplitter={false}
  >
    <Pane>
      <TableTabs />
    </Pane>
    {#if showTableDetails}
      <Pane size={30}>
        <div class="tableData">
          <div>
            Data: {currentTableData.displayName}
          </div>
          <div>
            Imported: {currentTableData.importedFrom}
          </div>
          {#each Object.keys(currentTableData.data) as k}
            {#if currentTableData.data[k].type === "time"}
              <div style="display: flex; margin: 5px;">
                {currentTableData.data[k].name}
                <input
                  type="text"
                  bind:value={currentTableData.data[k].timeFormat}
                  on:input={(e) => {
                    updateTimeFormat(k);
                  }}
                />
                <button
                  class="guessFmtBtn"
                  on:click={(e) => {
                    guessFormat(k);
                  }}>🔦</button
                >
              </div>
            {/if}
          {/each}
        </div>
      </Pane>
    {/if}
  </Splitpanes>
</Pane>
