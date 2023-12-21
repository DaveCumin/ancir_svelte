<script>
  import { data, graphs, activeGraphTab } from "../store";
  // @ts-ignore

  import {
    addProcessStep,
    componentMap,
    updateGraphProcess,
  } from "../components/ProcessStep.svelte";

  function removeProcess(sourceID, xy, processindex) {
    $graphs[$activeGraphTab].sourceData[sourceID][xy].processSteps.splice(
      processindex,
      1
    );
    updateGraphProcess($activeGraphTab, sourceID, xy);
  }

  function colorCallback(rgba, index) {
    $graphs[$activeGraphTab].sourceData[index].col = rgba.detail;
  }

  function getFieldNames(source) {
    return Object.keys(
      $data[$data.findIndex((d) => d.id === source.tableID)].data
    );
  }

  function addDataToGraph() {
    //TODO: make this generic / selectable to initialise
    $graphs[$activeGraphTab].sourceData.push({
      tableID: 9,
      x: {
        field: "value90",
        processSteps: [],
        processedData: [],
      },
      y: {
        field: "value91",
        processSteps: [],
        processedData: [],
      },
      col: { hex: "#78322e", alpha: 0.5 },
    });
    $graphs = $graphs;
  }

  function updateProcess(xy, sourcei, processindex, processParams) {
    $graphs[$activeGraphTab].sourceData[sourcei][xy].processSteps[
      processindex
    ].parameters = processParams;
    updateGraphProcess($activeGraphTab, sourcei, xy);
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

  function handleColorChange(event) {
    let i = event.target.dataset.index;
    $graphs[$activeGraphTab].sourceData[i].col.hex = event.srcElement.value;
  }
</script>

{#each $graphs[$activeGraphTab].sourceData as source, i}
  <div
    class="relative p-2.5 m-1.5 border border-neutral rounded shadow-sm transition ease-in-out delay-75 bg-base-100 hover:shadow-xl duration-200"
  >
    <div class="flex">
      <!-- <button class="removeGraphDataButton" on:click={() => removeGraphData(i)}>🗑️  </button> -->
    </div>

    <!-- TABLE -->
    <div class="flex">
      <label class="label font-semibold min-w-[130px]" for="dattable"
        >Table:</label
      >
      <select
        class="inline-flex select select-xs select-bordered select-neutral focus:outline-none w-32 h-8 bg-base-100 shadow-md mb-4"
        bind:value={$graphs[$activeGraphTab].sourceData[i].tableID}
      >
        {#each $data as d}
          <option value={d.id} selected={source.tableID === d.id ? true : false}
            >{d.displayName}</option
          >
        {/each}
      </select>
      <button class="removeProcessButton" on:click={() => removeGraphData(i)}>
        🗑️<!-- Trash bin symbol -->
      </button>
    </div>

    <!-- x field -->
    <div class="flex flex-col min-w-[280px]">
      <div class="flex justify-between items-center">
        <div class="flex">
          <label class="label font-semibold text-sm" for="dattable"
            >X (time):</label
          >
          <select
            class="inline-flex select select-neutral select-xs select-bordered focus:outline-none h-8 mt-1 w-20 ml-4 bg-base-100 shadow-md"
            id={"dattablex" + i}
            bind:value={$graphs[$activeGraphTab].sourceData[i].x.field}
          >
            {#each getFieldNames(source) as key}
              <option value={key}
                >{$data[$data.findIndex((d) => d.id === source.tableID)].data[
                  key
                ].name}</option
              >
            {/each}
          </select>
        </div>
        <!-- ADD PROCESS-->
        <button
          class="btn btn-xs shadow-lg items-center"
          on:click={() => addProcessStep("graph", "x", i)}
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
            ></path>
          </svg>
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex flex-col items-start ml-4">
          {#each source.x.processSteps as processStep, index}
            <div class="flex justify-start" id={"" + index}>
              <svelte:component
                this={componentMap[processStep.process].component}
                dataIN={$data[$data.findIndex((d) => d.id === source.tableID)]
                  .data[source.x.field].data}
                paramsStart={processStep.parameters}
                on:update={(event) =>
                  updateProcess("x", i, index, event.detail.params)}
              />
              <button
                class="removeProcessButton"
                on:click={() => removeProcess(i, "x", index)}
              >
                🗑️<!-- Trash bin symbol -->
              </button>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- y field -->
    <div class="flex flex-col min-w-[280px]">
      <div class="flex justify-between items-center">
        <div class="flex">
          <label
            class="label font-semibold text-sm min-w-[130px]"
            for="dattable">Y-values:</label
          >
          <select
            class="inline-flex select select-neutral select-xs select-bordered focus:outline-none h-8 w-20 mt-1 bg-base-100 shadow-md"
            id={"dattabley" + i}
            bind:value={$graphs[$activeGraphTab].sourceData[i].y.field}
          >
            {#each getFieldNames(source) as key}
              <option value={key}
                >{$data[$data.findIndex((d) => d.id === source.tableID)].data[
                  key
                ].name}</option
              >
            {/each}
          </select>
        </div>
        <!-- ADD PROCESS-->
        <button
          class="btn btn-xs shadow-lg items-center"
          on:click={() => addProcessStep("graph", "y", i)}
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
            ></path>
          </svg>
        </button>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex flex-col items-start ml-4">
          {#each source.y.processSteps as processStep, index}
            <div class="flex justify-start">
              <svelte:component
                this={componentMap[processStep.process].component}
                dataIN={$data[$data.findIndex((d) => d.id === source.tableID)]
                  .data[source.y.field].data}
                paramsStart={processStep.parameters}
                on:update={(event) =>
                  updateProcess("y", i, index, event.detail.params)}
              />
              <button
                class="ml-4"
                on:click={() => removeProcess(i, "y", index)}
              >
                🗑️ <!-- Trash bin symbol -->
              </button>
            </div>
          {/each}
        </div>
      </div>

      <!-- colour-->
    </div>
    <!-- HSV PIRCKER -->
    <input
      type="color"
      bind:value={$graphs[$activeGraphTab].sourceData[i].col.hex}
    />
    <input
      class="slider range range-info range-xs w-20 h-3"
      type="range"
      min="0"
      max="1"
      step="0.01"
      bind:value={$graphs[$activeGraphTab].sourceData[i].col.alpha}
    />
  </div>
{/each}

<!-- ADD DATA-->
<button class="ml-4 my-2 btn btn-info btn-xs" on:click={() => addDataToGraph()}>
  + Data
</button>

<style>
  /* Style for each data container */
  .data {
    /* background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    margin: 10px;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.3s, transform 0.3s;
    position: relative; */
  }

  /* Style for fields and their buttons */
  .field {
    /* display: flow;
    align-items: center;
    margin: 10px 0;
    flex-wrap: wrap; */
    /* Allow content to wrap to the next line */
  }

  .process {
    display: flex;
    align-items: center;
    /* Center vertically
    flex-wrap: wrap; /* Allow "process" elements to wrap */
  }

  .process-step {
    /* padding: 5px;
    display: flex;
    align-items: center; */
  }

  /* Style for process buttons */
  .removeProcessButton {
    /* border: none;
    background: none;
    color: #007bff; */
    /* Blue color for buttons */
    /* font-size: 18px;
    cursor: pointer;
    margin-left: 5px;
    display: none; */
  }

  /* Style for the "add" button */
  .addProcessButton {
    /* border: none;
    background: none;
    color: #007bff;  */
    /* Blue color for buttons */
    /* font-size: 18px;
    cursor: pointer;
    margin-top: 5px; */
    /* Add margin to separate it from the last "process" */
  }

  .modal {
    z-index: 1;
    opacity: 1;
  }
  .modal-box {
    z-index: 2;
  }
</style>
