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
    console.log(dataID);

    //remove any tables associated
    $dataIDsforTables = $dataIDsforTables.filter((dt) => dt !== dataID);
    $activeTableTab = $dataIDsforTables.length > 0 ? 0 : -1;

    console.log(
      "post table; dataIDs: active - " +
        $dataIDsforTables +
        " : " +
        $activeTableTab
    );

    //TODO remove any graph data using the data
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
    console.log(JSON.stringify($graphs));

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
  <div class="data bg-indigo-100 hover:bg-indigo-200 border rounded shadow-xl hover:transition-all">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="flex justify-start gap-2  items-center">
     
      <div class="" on:click={() => showDataTable(datum.id)}>
        <h5 class="font-bold text-2xl text-gray-700 hover:text-gray-950 font-display mb-2 cursor-pointer">
          {datum.displayName}
        </h5>
      </div>
       <button class="mr-1 px-2 py-1 hover:bg-indigo-200 mb-2" on:click={() => removeData(datum.id)}>
        🗑️ <!-- Trash bin symbol -->
      </button>
    </div>
   
    
    {#each Object.keys(datum.data) as key}
      <div class="font-semibold flex  justify-between items-center">
        {datum.data[key].name}

        {#if datum.data[key].processSteps.length > 0}
          <div class="process ">
            {#each datum.data[key].processSteps as processStep, index}
              <div class="process-step justify-start items-end gap-2" id={"" + index}>
            

                  <svelte:component
                    this={componentMap[processStep.process].component}
                    dataIN={$data[i].data[key].data}
                    paramsStart={componentMap[processStep.process].startParams}
                    bind:params={processStep.parameters}
                    on:update={(event) =>
                      updateProcessData(event, "data", datum.id, key)}
                  />
          

  <button
    class="mr-1 px-2 py-1 hover:bg-indigo-200"
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
          class="btn btn-xs btn-neutral shadow-lg items-center"
          on:click={() => addProcessStep("data", datum.id, key)}
        >
        <svg class='w-5 h-5' fill="currentColor" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"></path>
</svg>
       </button>
      </div>
    {/each}
  </div>
{/each}

<style>
  /* Style for each data container */
  .data {
  
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
    /* display: flex; */
    /* align-items: center; Center vertically */
    /* flex-wrap: wrap; Allow "process" elements to wrap */
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
    color: #007bff;   /* Blue color for buttons  */
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
    /* display: inline-block; Show buttons on hover */
  }
</style>
