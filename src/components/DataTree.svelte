<script>
  // @ts-nocheck

  //show the data in tables
  function showDataTable(ID) {
    const tab = $dataIDsforTables.indexOf(ID);
    if (tab < 0) {
      //tab not there
      $dataIDsforTables.push(ID);
      $dataIDsforTables = $dataIDsforTables;
      $activeTableTab = $dataIDsforTables.length - 1;
    } else {
      //tab
      $activeTableTab = tab;
    }
  }

  import { data, dataIDsforTables, activeTableTab, graphs } from "../store";

  import {
    addProcessStep,
    removeProcessStep,
    updateProcessData,
    componentMap,
  } from "./ProcessStep.svelte";

  function removeData(dataID) {
    //remove any tables associated
    $dataIDsforTables = $dataIDsforTables.filter((dt) => dt !== dataID);
    $activeTableTab = $dataIDsforTables.length > 0 ? 0 : -1;

    //remove any graph data using the data
    graphs.update((currentGraphs) =>
      currentGraphs.map((graph) => {
        // Use filter to keep only the source data objects with 'tableID' not equal to 'i'
        const updatedSourceData = graph.sourceData.filter(
          (data) => data.tableID !== dataID
        );

        // Return a new graph object with updated source data
        return {
          ...graph,
          sourceData: updatedSourceData,
        };
      })
    );

    //remove the data itself
    let dataIndex = $data.findIndex((d) => d.id === dataID);

    data.update((currentData) => {
      currentData.splice(dataIndex, 1);
      return currentData;
    });
  }
</script>

{#each $data as datum, i}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="data bg-base-100 m-2 p-2 border border-neutral rounded shadow-sm hover:shadow-xl"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="flex justify-start gap-2 items-center">
      <div class="" on:click={() => showDataTable(datum.id)}>
        <h5
          class="font-bold text-2xl text-content hover:bg-info font-display mb-2 cursor-pointer"
        >
          {datum.displayName}
        </h5>
      </div>
      <button
        class="mr-1 px-2 py-1 hover:bg-base-200 mb-2"
        on:click={() => removeData(datum.id)}
      >
        🗑️ <!-- Trash bin symbol -->
      </button>
    </div>

    {#each Object.keys(datum.data) as key}
      <div class="font-semibold flex justify-between items-center">
        {datum.data[key].name}
        <button
          class="btn btn-xs shadow-lg items-center"
          on:click={() => addProcessStep("data", datum.id, key)}
        >
          <svg
            class="w-5 h-5"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="3"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6v12m6-6H6"
            />
          </svg>
        </button>
      </div>
      {#if datum.data[key].processSteps.length > 0}
        <div class="flex">
          {#each datum.data[key].processSteps as processStep, index}
            <div class="flex justify-start items-end gap-2" id={"" + index}>
              <svelte:component
                this={componentMap[processStep.process].component}
                dataIN={$data[i].data[key].data}
                paramsStart={componentMap[processStep.process].startParams}
                bind:params={processStep.parameters}
                on:update={(event) =>
                  updateProcessData(event, "data", datum.id, key)}
              />

              <button
                class="mr-1 px-2 py-1 hover:bg-base-200"
                on:click={() => removeProcessStep("data", datum.id, key, index)}
              >
                🗑️ <!-- Trash bin symbol -->
              </button>
            </div>
          {/each}
        </div>
      {/if}
    {/each}
    <div />
  </div>
{/each}
