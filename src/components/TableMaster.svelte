<script>
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { dataIDsforTables, activeTableTab, data } from "../store.js";
  import TableTabs from "./TableTabs.svelte";
  import {
    getGuessedFormat,
    forceFornat,
    getPeriod,
  } from "../utils/time/TimeUtils.js";
  import { updateDataProcess } from "../components/ProcessStep.svelte";

  $: showTableDetails = $activeTableTab >= 0 ? true : false;
  $: currentTableData =
    $data[$data.findIndex((d) => d.id === $dataIDsforTables[$activeTableTab])];

  function updateTimeFormat(k) {
    //Update the timeData
    $data[
      $data.findIndex((d) => d.id === $dataIDsforTables[$activeTableTab])
    ].data[k].timeData = forceFornat(
      currentTableData.data[k].data,
      currentTableData.data[k].timeFormat
    );
    //Update the recordPeriod
    $data[
      $data.findIndex((d) => d.id === $dataIDsforTables[$activeTableTab])
    ].data[k].recordPeriod = getPeriod(
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
      <div id="TableMain" style="height: 100%; width: auto; overflow: auto;">
        <TableTabs />
      </div>
    </Pane>
    {#if showTableDetails}
      <Pane size={30}>
        <div id="TableMeta" style="height: 100%; width: auto; overflow: auto;">
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
                <div style="display: flex; margin: 5px; margin-left:1em;">
                  Sampling freq: {currentTableData.data[k].recordPeriod.minDiff}
                  hrs,
                  {currentTableData.data[k].recordPeriod.constant
                    ? "equal"
                    : "unequal"}
                </div>
              {/if}
            {/each}
          </div>
        </div>
      </Pane>
    {/if}
  </Splitpanes>
</Pane>

<style>
  .guessFmtBtn {
    margin-right: 10px;
  }
</style>
