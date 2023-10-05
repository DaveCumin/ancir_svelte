<script context="module">
  export function rgbaToHex(color) {
    // Ensure the color object has the required properties
    if (
      !color ||
      typeof color !== "object" ||
      isNaN(color.r) ||
      isNaN(color.g) ||
      isNaN(color.b)
    ) {
      return null;
    }
    // Convert the RGBA values to hexadecimal format
    const rHex = Math.round(color.r).toString(16).padStart(2, "0");
    const gHex = Math.round(color.g).toString(16).padStart(2, "0");
    const bHex = Math.round(color.b).toString(16).padStart(2, "0");

    // Create the hex color string (ignoring alpha)
    const hexColor = `#${rHex}${gHex}${bHex}`;

    return hexColor;
  }
</script>

<script>
  import Slider from "../../utils/Slider.svelte";
  import {
    data,
    graphs,
    activeGraphTab,
    dataIDsforTables,
    activeTableTab,
  } from "../../store";
  // @ts-ignore
  import { HsvPicker } from "svelte-color-picker";

  import {
    addProcessStep,
    removeProcessStep,
    componentMap,
    updateProcessData,
  } from "../../components/ProcessStep.svelte";

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

  let activeColChange = 0;
  let activeCol;

  function colorCallback(rgba) {
    activeCol = rgba.detail;
  }

  function getFieldNames(source) {
    return Object.keys(
      $data[$data.findIndex((d) => d.id === source.tableID)].data
    );
  }

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
</script>
<!-- 
    /* background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    margin: 10px;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.3s, transform 0.3s;
    position: relative; */ -->

{#each $graphs[$activeGraphTab].sourceData as source, i}
  <div class="relative p-2.5 m-1.5 shadow-inner hover:bg-blue-100 border rounded shadow-xl hover:transition-all">
    <!-- TABLE -->
    <div class="flex">
      <label for="dattable" class='label font-semibold  min-w-[130px] '>Table:</label>
      <select class='inline-flex select select-info w-32 mb-1 bg-blue-50 shadow-md mb-4' bind:value={$graphs[$activeGraphTab].sourceData[i].tableID}>
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
        <label for="dattable" class='label font-semibold  min-w-[130px]'>X-values (time):</label>
        <select class='inline-flex select select-info w-24 mb-1 bg-blue-50 shadow-md' bind:value={$graphs[$activeGraphTab].sourceData[i].x.field}>
          {#each getFieldNames(source) as key}aa
            <option value={key}
              >{$data[$data.findIndex((d) => d.id === source.tableID)].data[key]
                .name}</option
            >
          {/each}
        </select>
      </div>

      <div class="process ">
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
             class="w-6 h-6 hover:bg-gray-200 items-center"
        on:click={() => addProcessStep("graph", "x", i)}
      >       <svg fill="currentColor" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"></path>
</svg>
         <!-- Plus sign symbol ➕ -->
      </button>
    </div>

    <!-- y field -->
    <div class="flex ">
      <label for="dattable" class='label font-semibold  min-w-[130px]'>Y-values:</label>
      <select class='inline-flex select select-info w-24 mb-1 bg-blue-50 shadow-md'
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
      </div>
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
             class="w-6 h-6 hover:bg-gray-200 items-center "
        on:click={() => addProcessStep("graph", "y", i)}
      >       <svg fill="currentColor" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"></path>
</svg>
         <!-- Plus sign symbol ➕ -->
      </button>
   

    </div>

    <!-- colour-->
    <div>
      <button
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



  <!-- <div class="form-control flex flex-row  items-center w-full max-w-md ">
     <label for='val' class="label min-w-[130px]">
       <span class="label-text">Value:</span>
     </label>
      <input type="number" id="val" bind:value={params.val} class="input input-bordered input-info w-32 max-w-xs"  />
     <Slider min={1} max={100} bind:value={params.val} />
   </div> -->
   <div class='hover:bg-blue-100 border rounded shadow-xl hover:transition-all pt-4'>
    <div class='flex pl-4'>
  <label for="val" class="label font-semibold min-w-[130px]">Width:</label>
  <input
  class="input input-bordered input-info h-10 w-24 mr-2 max-w-xs mb-1 bg-blue-50 shadow-md"
    type="number"
    id="min"
    bind:value={$graphs[$activeGraphTab].params.width}
  />
  <Slider
    min={100}
    max={1000}
    bind:value={$graphs[$activeGraphTab].params.width}
  />
</div>

     <div class='flex p-2 pl-4'>
       <label for="val" class='label font-semibold  min-w-[130px]'>dayHeight:</label>
       <input
       class="input input-bordered input-info w-24 h-10 mr-2 max-w-xs bg-blue-50 shadow-md"
         type="number"
         id="min"
         bind:value={$graphs[$activeGraphTab].params.dayHeight}
       />
       <Slider
         min={10}
         max={30}
         bind:value={$graphs[$activeGraphTab].params.dayHeight}
       />
     </div>
     
     <div class='flex p-2 pl-4 pb-10'>
       <label for="val" class='label font-semibold  min-w-[130px]'>betweenHeight:</label>
       <input
       class="input input-bordered input-info w-24 h-10 mr-2 max-w-xs bg-blue-50 shadow-md"
         type="number"
         id="min"
         bind:value={$graphs[$activeGraphTab].params.betweenHeight}
       />
       <Slider
         min={1}
         max={20}
         bind:value={$graphs[$activeGraphTab].params.betweenHeight}
       />
     </div>
   </div>

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
