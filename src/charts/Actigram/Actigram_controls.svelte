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
  <div class="data">
    <button class="removeGraphDataButton" on:click={() => removeGraphData(i)}>
      🗑️ <!-- Trash bin symbol -->
    </button>
    <!-- TABLE -->
    <div class="field">
      <label for="dattable">Table:</label>
      <select bind:value={$graphs[$activeGraphTab].sourceData[i].tableID}>
        {#each $data as d}
          <option value={d.id} selected={source.tableID === d.id ? true : false}
            >{d.displayName}</option
          >
        {/each}
      </select>
    </div>

    <!-- x field -->
    <div class="field">
      <label for="dattable">X-values (time):</label>
      <select bind:value={$graphs[$activeGraphTab].sourceData[i].x.field}>
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

    <!-- y field -->
    <div class="field">
      <label for="dattable">Y-values:</label>
      <select
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

      <div class="process">
        {#each source.y.processSteps as processStep, index}
          <div class="process-step">
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
        ➕ <!-- Plus sign symbol -->
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

<!-- ADD DATA-->
<button class="addProcessButton" on:click={() => addDataToGraph()}>
  ➕ Data
</button>

<div>
  <label for="val">Width:</label>
  <input
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

<div>
  <label for="val">dayHeight:</label>
  <input
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

<div>
  <label for="val">betweenHeight:</label>
  <input
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
