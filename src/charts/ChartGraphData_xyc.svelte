<script>
  import { rgbaToHex } from "../utils/Color";
  import {
    data,
    graphs,
    activeGraphTab,
    dataIDsforTables,
    activeTableTab,
  } from "../store";
  // @ts-ignore
  import { HsvPicker } from "svelte-color-picker";

  import {
    addProcessStep,
    removeProcessStep,
    componentMap,
    updateProcessData,
  } from "../components/ProcessStep.svelte";

  $: hsvPickerVisibility = Array(
    $graphs[$activeGraphTab].sourceData.length
  ).fill(false);

  function toggleHsvPicker(index) {
    hsvPickerVisibility[index] = !hsvPickerVisibility[index];
  }

  function setHsvPicker(index) {
    $graphs[$activeGraphTab].sourceData[index].col = activeCol;
    toggleHsvPicker(index);
  }

  let activeCol;

  function colorCallback(rgba) {
    activeCol = rgba.detail;
  }

  function getFieldNames(source) {
    return Object.keys(
      $data[$data.findIndex((d) => d.id === source.tableID)].data
    );
  }

  function addDataToGraph() {
    //TODO: make this generic
    $graphs[$activeGraphTab].sourceData.push({
      tableID: 6,
      x: {
        field: "value0",
        processSteps: [],
        processedData: [],
      },
      y: {
        field: "value1",
        processSteps: [],
        processedData: [],
      },
      col: { r: 251, g: 251, b: 251, a: 0.5 },
    });
    $graphs = $graphs;
  }

  function removeGraphData(srcID) {
    graphs.update((currentData) => {
      const newData = [...currentData];
      const currentGraphID = newData[$activeGraphTab].id;

      // Find the current graph by ID
      const currentGraph = newData.find((graph) => graph.id === currentGraphID);

      // Check if the currentGraph exists and has sourceData
      if (currentGraph && currentGraph.sourceData) {
        // Remove the i-th sourceData element from the currentGraph
        currentGraph.sourceData.splice(srcID, 1);
      }

      return newData;
    });
  }
</script>

{#each $graphs[$activeGraphTab].sourceData as source, i}
  <div class="relative p-2.5 m-1.5 shadow-inner hover:bg-blue-100 border rounded shadow-xl hover:transition-all">
    <div class="flex">
      <!-- <button class="removeGraphDataButton" on:click={() => removeGraphData(i)}>🗑️</button> -->
    </div>
    <!-- TABLE -->
       <div class="flex">
      <label class="label font-semibold min-w-[130px]" for="dattable">Table:</label>
      <select class='inline-flex select select-info w-32 mb-1 bg-blue-50 shadow-md mb-4'   bind:value={$graphs[$activeGraphTab].sourceData[i].tableID}>
        {#each $data as d}
          <option value={d.id} selected={source.tableID === d.id ? true : false}
            >{d.displayName}</option
          >
        {/each}
      </select>
    </div>

    <!-- x field -->
      <div class="flex items-center justify-between">
      <div class='flex'>
      <label class='label font-semibold' for="dattable">X-values (time):</label>
      <select class='inline-flex select select-info w-24 mb-1 bg-blue-50 shadow-md' bind:value={$graphs[$activeGraphTab].sourceData[i].x.field}>
        {#each getFieldNames(source) as key}
          <option value={key}
            >{$data[$data.findIndex((d) => d.id === source.tableID)].data[key]
              .name}</option
          >
        {/each}
      </select>

      <div class="process">
        {#each source.x.processSteps as processStep, index}
          <div class="process-step" id={"" + index}>
            <svelte:component
              this={componentMap[processStep.process].component}
              dataIN={$data[$data.findIndex((d) => d.id === source.tableID)]
                .data[source.x.field].data}
              paramsStart={componentMap[processStep.process].startParams}
              bind:params={processStep.parameters}
              on:update={(event) => updateProcessData(event, "graph", "x", i)}
            />
            <button
              class="removeProcessButton"
              on:click={() => removeProcessStep("graph", "x", i, index)}
            >
              🗑️ <!-- Trash bin symbol -->
            </button>
          </div>
        {/each}
      </div>

      <!-- ADD PROCESS-->
      <button
        class="addProcessButton"
        on:click={() => addProcessStep("graph", "x", i)}
      >
        ➕ <!-- Plus sign symbol -->
      </button>
    </div>
     </div>
     

    <!-- y field -->
      <div class="flex ">
      <label class='label font-semibold  min-w-[130px]' for="dattable">Y-values:</label>
      <select
      class='inline-flex select select-info w-24 mb-1 bg-blue-50 shadow-md'

        id={"dattable" + i}
        bind:value={$graphs[$activeGraphTab].sourceData[i].y.field}
      >
        {#each getFieldNames(source) as key}
          <option value={key}
            >{$data[$data.findIndex((d) => d.id === source.tableID)].data[key]
              .name}</option
          >
        {/each}
      </select>
   <div class="flex items-center justify-between">
      <div class="process">
        {#each source.y.processSteps as processStep, index}
          <div class="flex flex-col">

            <svelte:component
              this={componentMap[processStep.process].component}
              dataIN={$data[$data.findIndex((d) => d.id === source.tableID)]
                .data[source.y.field].data}
              paramsStart={componentMap[processStep.process].startParams}
              bind:params={processStep.parameters}
              on:update={(event) => updateProcessData(event, "graph", "y", i)}
            />
            <button
              class="removeProcessButton"
              on:click={() => removeProcessStep("graph", "y", i, index)}
            >
              🗑️ <!-- Trash bin symbol -->
            </button>
          </div>
        {/each}
      </div>

      <!-- ADD PROCESS-->
      <button
        class="addProcessButton"
        on:click={() => addProcessStep("graph", "y", i)}
      >
        <svg fill="currentColor" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"></path>
</svg>
      </button>
    </div>

  </div>
    <!-- colour-->
    <div>
      <button
        class="w-6 h-6 hover:bg-gray-200 items-center "

        on:click={() => toggleHsvPicker(i)}
        style="background-color: {rgbaToHex(
          $graphs[$activeGraphTab].sourceData[i].col
        )};"
      >
        Colour
      </button>
    </div>
    {#if hsvPickerVisibility[i]}
      <!-- HSV Picker component for this item -->
      <div class="modal">
        <div class="modal-content">
          <HsvPicker
            on:colorChange={colorCallback}
            startColor={rgbaToHex($graphs[$activeGraphTab].sourceData[i].col)}
          />
          <div class="modal-buttons">
            <button on:click={() => setHsvPicker(i)}>Set</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/each}

<!-- ADD DATA-->
<button class="addProcessButton" on:click={() => addDataToGraph()}>
  ➕ Data
</button>

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
  .removeProcessButton {
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
  .addProcessButton:hover {
    text-decoration: underline;
    color: #0056b3; /* Darker blue on hover */
  }

  .modal {
    position: fixed;
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  .modal-content {
    background-color: #fefefe;
    margin: 15% 72%;
    padding: 20px;
    border: 1px solid #888;
    width: 240px;
  }
</style>
