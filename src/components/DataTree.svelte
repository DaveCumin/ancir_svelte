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

  function removeData(i) {
    console.log(i);

    //remove any tables associated
    $dataIDsforTables = $dataIDsforTables.filter((dt) => dt !== i);
    $activeTableTab = $dataIDsforTables.length > 0 ? 0 : -1;

    console.log(
      "post table; dataIDs: active - " +
        $dataIDsforTables +
        " : " +
        $activeTableTab
    );

    //TODO remove any graph data using the data
    graphs.update((currentGraphs) =>
      currentGraphs.filter((graph) => {
        // Use some to check if 'i' matches any 'tableID' in sourceData
        const shouldRemove = graph.sourceData.some(
          (data) => data.tableID === i
        );

        // Return true to keep the graph if 'i' doesn't match any 'tableID'
        return !shouldRemove;
      })
    );
    console.log(JSON.stringify($graphs));

    //remove the data itself
    data.update((currentData) => {
      currentData.splice(i, 1);
      return currentData;
    });
    console.log(JSON.stringify($data));
  }
</script>

{#each $data as datum, i}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="data">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="dataheading" on:click={() => showDataTable(datum.id)}>
      <button class="removeDataButton" on:click={() => removeData(i)}>
        🗑️ <!-- Trash bin symbol -->
      </button>
      <div class="dataheading">{datum.displayName}</div>
    </div>
    {#each Object.keys(datum.data) as key}
      <div class="field">
        {datum.data[key].name}

        {#if datum.data[key].processSteps.length > 0}
          <div class="process">
            {#each datum.data[key].processSteps as processStep, index}
              <div class="process-step" id={"" + index}>
                <svelte:component
                  this={componentMap[processStep.process].component}
                  dataIN={$data[i].data[key].data}
                  paramsStart={componentMap[processStep.process].startParams}
                  bind:params={processStep.parameters}
                  on:update={(event) =>
                    updateProcessData(event, "data", i, key)}
                />

                <button
                  class="removeProcessButton"
                  on:click={() =>
                    removeProcessStep("data", datum.id, key, index)}
                >
                  🗑️ <!-- Trash bin symbol -->
                </button>
              </div>
            {/each}
          </div>
        {/if}
        <button
          class="addProcessButton"
          on:click={() => addProcessStep("data", datum.id, key)}
        >
          ➕ <!-- Plus sign symbol -->
        </button>
      </div>
    {/each}
  </div>
{/each}

<style>
  /* Style for each data container */
  .data {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    margin: 10px;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.3s, transform 0.3s;
    position: relative;
  }

  /* Style for fields and their buttons */
  .field {
    display: flow;
    align-items: center;
    margin: 10px 0;
    flex-wrap: wrap; /* Allow content to wrap to the next line */
  }

  .process {
    display: flex;
    align-items: center; /* Center vertically */
    flex-wrap: wrap; /* Allow "process" elements to wrap */
  }

  .process-step {
    padding: 5px;
    display: flex;
    align-items: center;
  }

  /* Style for process buttons */

  .removeProcessButton,
  .removeDataButton {
    border: none;
    background: none;
    color: #007bff; /* Blue color for buttons */
    font-size: 18px;
    cursor: pointer;
    margin-left: 5px;
    display: none;
  }

  /* Style for the "add" button */
  .addProcessButton {
    border: none;
    background: none;
    color: #007bff; /* Blue color for buttons */
    font-size: 18px;
    cursor: pointer;
    margin-top: 5px; /* Add margin to separate it from the last "process" */
  }

  .field:hover {
    background: white;
  }
  /* Style for the buttons on hover */

  .field:hover .removeProcessButton,
  .field:hover .addProcessButton {
    display: inline-block; /* Show buttons on hover */
  }

  /* Style for the buttons on hover */

  .removeProcessButton:hover,
  .addProcessButton:hover,
  .removeDataButton:hover {
    text-decoration: underline;
    color: #0056b3; /* Darker blue on hover */
  }

  .dataheading:hover .removeDataButton {
    display: inline-block; /* Show buttons on hover */
  }
</style>
