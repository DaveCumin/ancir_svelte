<script>
  import { rgbaToHex, rgbaTorgba } from "../utils/Color";
  import { data, graphs, activeGraphTab } from "../store";
  // @ts-ignore
   import ColorPicker  from 'svelte-awesome-color-picker';

  import {
    addProcessStep,
    removeProcessStep,
    componentMap,
    updateProcessData,
  } from "../components/ProcessStep.svelte";

  let hsvPickerVisibility = Array(
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

  function colorCallback(rgba, index) {
    activeCol = rgba.detail;
    $graphs[$activeGraphTab].sourceData[index].col = activeCol;
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
    hsvPickerVisibility.push(false);
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

    hsvPickerVisibility.slice(srcID, 1);
  }
</script>

{#each $graphs[$activeGraphTab].sourceData as source, i}
   <div class="relative p-2.5 m-1.5 shadow-inner border rounded shadow-xl transition ease-in-out delay-75 bg-indigo-100 hover:bg-indigo-200 duration-200 ">
 <div class="flex">

   <!-- <button class="removeGraphDataButton" on:click={() => removeGraphData(i)}>🗑️  </button> -->
 </div>
    
    <!-- TABLE -->
    <div class="flex">
      <label class="label font-semibold min-w-[130px]" for="dattable">Table:</label>
      <select class='inline-flex select select-info w-32 mb-1 bg-blue-50 shadow-md mb-4'    bind:value={$graphs[$activeGraphTab].sourceData[i].tableID}>
        {#each $data as d}
          <option value={d.id} selected={source.tableID === d.id ? true : false}
            >{d.displayName}</option
          >
        {/each}
      </select>
    </div>

    <!-- x field -->
        <div class="flex flex-col min-w-[280px]">
        <div class='flex justify-between items-center'>
<div class='flex '>
    <label  class='label font-semibold' for="dattable">X-values (time):</label>
    <select
    class='inline-flex select select-info w-24 mb-1 bg-blue-50 shadow-md'
      id={"dattablex" + i}
      bind:value={$graphs[$activeGraphTab].sourceData[i].x.field}
    >
      {#each getFieldNames(source) as key}
        <option value={key}
          >{$data[$data.findIndex((d) => d.id === source.tableID)].data[key]
            .name}</option
        >
      {/each}
    </select>
  </div>
        <!-- ADD PROCESS-->
         <button
         class="btn btn-xs btn-neutral shadow-lg items-center"
        on:click={() => addProcessStep("graph", "x", i)}
      >
                      <svg class='w-5 h-5' fill="currentColor" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"></path>
</svg>
      </button>

 </div>
     
    <div class="flex  items-center justify-between ">
      <div class="flex flex-col items-start  ml-4 ">
        {#each source.x.processSteps as processStep, index}
         <div class="flex justify-start" id={"" + index}>
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
       </div>


    </div>

    <!-- y field -->
      <div class="flex flex-col min-w-[280px] ">
        <div class='flex justify-between items-center'>
          <div class='flex'>

            <label class='label font-semibold  min-w-[130px]'  for="dattable">Y-values:</label>
            <select
             class='inline-flex select select-info w-24 mb-1 bg-blue-50 shadow-md'
              id={"dattabley" + i}
              bind:value={$graphs[$activeGraphTab].sourceData[i].y.field}
            >
              {#each getFieldNames(source) as key}
                <option value={key}
                  >{$data[$data.findIndex((d) => d.id === source.tableID)].data[key]
                    .name}</option
                >
              {/each}
            </select>
          </div>
                <!-- ADD PROCESS-->
      <button
            class="btn btn-xs btn-neutral shadow-lg items-center"
        on:click={() => addProcessStep("graph", "y", i)}
      >
        <svg class='w-5 h-5' fill="currentColor" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"></path>
</svg>
      </button>
        </div>
   <div class="flex  items-center justify-between">
      <div class="flex flex-col items-start  ml-4">
        {#each source.y.processSteps as processStep, index}
          <div class="flex justify-start">

            <svelte:component
              this={componentMap[processStep.process].component}
              dataIN={$data[$data.findIndex((d) => d.id === source.tableID)]
                .data[source.y.field].data}
              paramsStart={componentMap[processStep.process].startParams}
              bind:params={processStep.parameters}
              on:update={(event) => updateProcessData(event, "graph", "y", i)}
            />
            <button
              class="ml-4 "
              on:click={() => removeProcessStep("graph", "y", i, index)}
            >
              🗑️ <!-- Trash bin symbol -->
            </button>
          </div>
        {/each}
      </div>


    </div>

    <!-- colour-->
 
      <!-- <button
        on:click={() => toggleHsvPicker(i)}
        style="background-color: {rgbaTorgba(
          $graphs[$activeGraphTab].sourceData[i].col
        )};"
      >
        Colour
      </button> -->
    </div>
    <!-- {#if hsvPickerVisibility[i]} -->
 <!-- HSV PIRCKER NEW -->
      <div class='flex w-12'>
        <ColorPicker label={'Colour'}
            on:colorChange={colorCallback}
            bind:rgb={$graphs[$activeGraphTab].sourceData[i].col}
          />
    </div>
      <!-- HSV Picker component for this item -->
      <!-- <div class="modal">
        <div class="modal-content">
          <HsvPicker
            on:colorChange={(rgba) => colorCallback(rgba, i)}
            startColor={rgbaToHex($graphs[$activeGraphTab].sourceData[i].col)}
          />

          <div class="modal-buttons">
            <button on:click={() => setHsvPicker(i)}>Done</button>
          </div>
        </div>
      </div> -->
    <!-- {/if} -->
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
  z-index:1;
  opacity:1;;
}
.modal-box {
  z-index:2;
}

</style>
