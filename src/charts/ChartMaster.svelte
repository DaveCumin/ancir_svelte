<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab, contextMenu } from "../store";
  import { addProcess } from "../components/ProcessStep.svelte";
  import Slider from "../utils/Slider.svelte";
  // @ts-ignore

  import {
    componentMap,
    updateGraphProcess,
  } from "../components/ProcessStep.svelte";

  import { graphMap } from "../components/GraphMaster.svelte";

  $: prototypechartvalues =
    graphMap[$graphs[$activeGraphTab].graph].prototypechartvalues;

  function removeProcess(sourceID, xy, processindex) {
    $graphs[$activeGraphTab].sourceData[sourceID].chartvalues[
      xy
    ].processSteps.splice(processindex, 1);
    updateGraphProcess($activeGraphTab, sourceID, xy);
  }

  function getFieldNames(source) {
    return Object.keys(
      $data[$data.findIndex((d) => d.id === source.tableID)].data
    );
  }

  function addDataToGraph() {
    //TODO: make this generic / selectable to initialise
    // use graphMap prototypechartvalues
    console.log(graphMap);
    console.log(prototypechartvalues);

    let chartvalues = {};

    // Iterate over the keys of the original object
    Object.keys(prototypechartvalues).forEach((key) => {
      // Create a new object structure for each key
      chartvalues[key] = {
        field: "",
        processSteps: [],
        processedData: [],
      };
    });

    console.log(chartvalues);

    $graphs[$activeGraphTab].sourceData.push({
      tableID: 9,
      name: "data name",
      chartvalues: chartvalues,
      col: { hex: "#78322e", alpha: 0.5 },
    });
    $graphs = $graphs;
  }

  function updateProcess(xy, sourcei, processindex, processParams) {
    $graphs[$activeGraphTab].sourceData[sourcei].chartvalues[xy].processSteps[
      processindex
    ].parameters = processParams;
    updateGraphProcess($activeGraphTab, sourcei, xy);
  }

  function removeGraphData(srcID) {
    console.log(srcID);
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

  function createProcessContext(where, id, fieldName) {
    $contextMenu.labels = Object.keys(componentMap);
    for (let i = 0; i < $contextMenu.labels.length; i++) {
      $contextMenu.funcs[i] = () =>
        addProcess($contextMenu.labels[i], where, id, fieldName);
    }
  }

  function getData(source, key) {
    if (
      $data[$data.findIndex((d) => d.id === source.tableID)].data[
        source.chartvalues[key].field
      ].type === "time"
    ) {
      return $data[$data.findIndex((d) => d.id === source.tableID)].data[
        source.chartvalues[key].field
      ].timeData;
    }

    return $data[$data.findIndex((d) => d.id === source.tableID)].data[
      source.chartvalues[key].field
    ].data;
  }
</script>

<h1>Graph Data</h1>
<div class="graphDataTree">
  {#each $graphs[$activeGraphTab].sourceData as source, sourceIndex}
    <details open class="dataTable">
      <summary
        >{source.name}

        <div
          class="deleteTable hoverbutton"
          on:click={(e) => {
            e.preventDefault();
            removeGraphData(sourceIndex);
          }}
        >
          🗑️
        </div>
      </summary>

      <div class="tableLabel">
        Table: {$data.find((entry) => entry.id === source.tableID).displayName}
      </div>

      {#each Object.keys(source.chartvalues) as key}
        <details
          open
          class="field {source.chartvalues[key].processSteps.length > 0
            ? ''
            : 'no-arrow'}"
        >
          <summary
            >{key}:
            <span
              class="addbutton hoverbutton showContextMenu"
              on:click={(e) => {
                e.preventDefault();
                createProcessContext("graph", sourceIndex, key);
              }}>+</span
            >
            <span
              ><select
                class="selectField"
                bind:value={source.chartvalues[key].field}
                on:change={(e) => {
                  updateGraphProcess($activeGraphTab, sourceIndex, key);
                }}
              >
                {#each getFieldNames(source) as fields}
                  <option value={fields}
                    >{$data[$data.findIndex((d) => d.id === source.tableID)]
                      .data[fields].name}</option
                  >
                {/each}
              </select></span
            >
          </summary>
          {#each source.chartvalues[key].processSteps as ps, psIndex}
            <details open class="process">
              <summary
                >{ps.process}
                <div
                  class="deleteProcess hoverbutton"
                  on:click={(e) => {
                    e.preventDefault();
                    removeProcess(sourceIndex, key, psIndex);
                  }}
                >
                  🗑️
                </div></summary
              >
              <div class="processDetails">
                <svelte:component
                  this={componentMap[ps.process].component}
                  dataIN={getData(source, key)}
                  paramsStart={ps.parameters}
                  on:update={(event) => {
                    updateProcess(
                      key,
                      sourceIndex,
                      psIndex,
                      event.detail.params
                    );
                  }}
                />
              </div>
            </details>
          {/each}
        </details>
      {/each}
      <!-- HSV PIRCKER -->
      <div class="colour">
        <input
          class="colourPicker"
          type="color"
          style="background: {$graphs[$activeGraphTab].sourceData[sourceIndex]
            .col.hex}"
          bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].col.hex}
        />
        <div class="sliderContainer">
          <Slider
            min="0"
            max="1"
            step="0.01"
            label="Alpha: "
            bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].col
              .alpha}
          />
        </div>
      </div>
    </details>
  {/each}
</div>

<!-- ADD DATA-->
<button class="ml-4 my-2 btn btn-info btn-xs" on:click={() => addDataToGraph()}>
  + Data
</button>

<style>
  .graphDataTree {
    width: calc(100% - 12px);
    border-radius: 0;
    margin-left: 6px;
    min-width: 200px;
  }

  details {
    padding: 0px 10px;
  }

  summary {
    padding: 0px 10px;
    cursor: pointer;
  }
  .dataTable {
    margin-left: 0.5em;
    box-shadow: 1px 1px 5px #888888;
    padding: 10px 0px;
    margin: 8px 0px 10px 0px;
  }

  .dataTable > summary {
    font-size: 1.2em;
    font-weight: bold;
  }

  .tableLabel {
    margin: 1em 1em 0.5em;
  }

  .field {
    margin-left: 1.5em;
    padding: 5px 0px;
  }

  .process[open] {
    margin-bottom: 15px;
    margin-top: 5px;
    margin-right: 10px;
    box-shadow: 1px 1px 5px #888888;
  }

  .process {
    margin-left: 1.5em;
    padding: 5px 0px;
  }

  .processDetails {
    padding: 0.5em;
  }

  .no-arrow summary {
    list-style: none;
    cursor: default;
  }

  .no-arrow summary:before {
    content: "\25AC\00a0";
    margin-left: -2px;
  }

  .addbutton {
    float: right;
    cursor: pointer;
    margin-right: 0em;
  }

  .addbutton:hover {
    background: #eee;
    padding: 0.2em 0.5em;
    margin-right: -0.5em;
    margin-top: -0.2em;
    border-radius: 20%;
  }

  .label {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .label span {
    margin-right: 10px;
  }

  .processItem {
    padding: 10px 0px;
  }

  .deleteTable {
    display: inline-block;
    float: right;
    cursor: pointer;
    margin-right: 0em;
    z-index: 2;
  }
  .hoverbutton:hover {
    background: #aaaaaa;
    padding: 0.2em 0.5em;
    margin: -0.2em -0.5em;
    border-radius: 20%;
    cursor: pointer;
  }

  .viewTable {
    display: inline-block;
    float: right;
    cursor: pointer;
    margin-right: 0.5em;
  }
  .viewTable:hover {
    margin-right: 0em;
    cursor: pointer;
  }

  .deleteProcess {
    display: inline-block;
    float: right;
    cursor: pointer;
    margin-right: 0em;
  }

  .colour {
    display: flex;
    align-items: center;
    margin-left: 1em;
    margin-right: 1em;
  }
  .colourPicker {
    border-radius: 25px;
    height: 2.5em;
    padding: 0;
    width: 2.5em;
    margin-right: 1em;
  }
  .colourPicker::-webkit-color-swatch {
    display: none;
  }
  .colourPicker::-moz-color-swatch {
    display: none;
  }
  .sliderContainer {
    width: calc(100% - 3.5em);
  }
  .selectField {
    height: 1.5rem;
    align-self: center;
    border-radius: 0.5rem;
    width: 50%;
    float: right;
    margin-right: calc(0.5em + 2px);
    margin-top: -2px;
  }
</style>
