<script>
  // @ts-nocheck
  // @ts-ignore

  import {
    data,
    graphs,
    activeGraphTab,
    contextMenu,
    graphTabs,
  } from "../store";
  import { addProcess } from "../components/ProcessStep.svelte";
  import Slider from "../utils/Slider.svelte";
  import InPlaceEdit from "../utils/InPlaceEdit.svelte";

  import {
    componentMap,
    updateGraphProcess,
  } from "../components/ProcessStep.svelte";

  import { graphMap } from "../components/GraphMaster.svelte";
  import { onMount } from "svelte";

  //force the refresh from the start
  onMount(() => {
    updateGraphProcess($activeGraphTab, 0, "time");
    updateGraphProcess($activeGraphTab, 1, "time");
  });

  let prototypechartvalues = {};
  let prototypeother = {};
  $: {
    if ($activeGraphTab >= 0) {
      prototypechartvalues =
        graphMap[$graphs[$activeGraphTab].graph].prototypechartvalues;
      prototypeother = graphMap[$graphs[$activeGraphTab].graph].prototypeother;
    }
  }
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

  function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  export function addDataToGraph(tableID_IN) {
    // use graphMap prototypechartvalues
    let chartvalues = {};

    // Iterate over the keys of the original object, make the fields
    Object.keys(prototypechartvalues).forEach((key, cdindex) => {
      // Create a new object structure for each key
      chartvalues[key] = {
        field: Object.keys(
          $data[$data.findIndex((d) => d.id === tableID_IN)].data
        )[cdindex], //{insert fieldnames in order},
        processSteps: [],
        processedData: getDataFromTable(
          tableID_IN,
          Object.keys($data[$data.findIndex((d) => d.id === tableID_IN)].data)[
            cdindex
          ]
        ),
      };
    });

    // every graph has a tableID and a name; then add chartvalues
    $graphs[$activeGraphTab].sourceData.push({
      tableID: tableID_IN,
      name: "Data " + (1 + $graphs[$activeGraphTab].sourceData.length),
      chartvalues: chartvalues,
      ...deepCopy(prototypeother),
    });

    //To refresh in svelte
    $graphs = $graphs;
  }

  //Update a process in the graph
  function updateProcess(xy, sourcei, processindex, processParams) {
    $graphs[$activeGraphTab].sourceData[sourcei].chartvalues[xy].processSteps[
      processindex
    ].parameters = processParams;
    updateGraphProcess($activeGraphTab, sourcei, xy);
  }

  //remove data from a graph
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

  function newData(where, id, fieldName) {
    $contextMenu.labels = Object.keys(componentMap);
    for (let i = 0; i < $contextMenu.labels.length; i++) {
      $contextMenu.funcs[i] = () =>
        addProcess($contextMenu.labels[i], where, id, fieldName);
    }
  }

  function getDataFromTable(tableID_IN, key) {
    if (
      $data[$data.findIndex((d) => d.id === tableID_IN)].data[key].type ===
      "time"
    ) {
      return $data[$data.findIndex((d) => d.id === tableID_IN)].data[key]
        .timeData;
    }

    return $data[$data.findIndex((d) => d.id === tableID_IN)].data[key].data;
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

  function createnewDataProcessContext() {
    $contextMenu.labels = [];
    $contextMenu.funcs = [];
    for (let i = 0; i < $data.length; i++) {
      $contextMenu.labels.push($data[i].displayName);
      $contextMenu.funcs.push(() => addDataToGraph($data[i].id));
    }
  }
</script>

{#if $activeGraphTab < 0}
  <!-- Empty -->
{:else}
  <div style="margin: 1em 1em 0 0;">
    <h1 style="display: inline;">{$graphTabs[$activeGraphTab].name} Data</h1>
    <span
      class="addbutton hoverbutton showContextMenu"
      on:click={(e) => {
        e.preventDefault();
        createnewDataProcessContext();
      }}>+</span
    >
  </div>

  <div class="graphDataTree">
    {#each $graphs[$activeGraphTab].sourceData as source, sourceIndex}
      <details open class="dataTable">
        <summary
          ><InPlaceEdit bind:value={source.name} />

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
          Table: {$data.find((entry) => entry.id === source.tableID)
            .displayName}
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
                  newData("graph", sourceIndex, key);
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
                    typeTime={{
                      type: $data[
                        $data.findIndex((d) => d.id === source.tableID)
                      ].data[source.chartvalues[key].field].type,
                      tocheck: { tableID: source.tableID, key: key },
                    }}
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

        <!-- PUT IN THE OTHER CONTROLS-->
        {#each Object.keys(graphMap[$graphs[$activeGraphTab].graph].prototypeother) as protoKey, keyIndex}
          <!-- SLIDER -->
          {#if graphMap[$graphs[$activeGraphTab].graph].othertypes[keyIndex] === "colour"}
            <div class="colour">
              <input
                class="colourPicker"
                id={sourceIndex}
                type="color"
                style="background: {$graphs[$activeGraphTab].sourceData[
                  sourceIndex
                ].col.hex}"
                bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].col
                  .hex}
              />
              <div class="sliderContainer">
                <Slider
                  min="0"
                  max="1"
                  step="0.01"
                  limits={[0, 1]}
                  label="Alpha: "
                  bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex]
                    .col.alpha}
                />
              </div>
            </div>
          {/if}
          <!-- SLIDER -->
          {#if graphMap[$graphs[$activeGraphTab].graph].othertypes[keyIndex] === "slider"}
            <div class="itemsliderContainer">
              <Slider
                min="0.5"
                max="10"
                step="0.5"
                label={protoKey.charAt(0).toUpperCase() +
                  protoKey.slice(1) +
                  ":"}
                bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex]
                  .size}
              />
            </div>
          {/if}
        {/each}
      </details>
    {/each}
  </div>
{/if}

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
    font-size: 1.1em;
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
    background: var(--hover-color);
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
    background: var(--hover-color);
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
  .itemsliderContainer {
    width: calc(100% - 2em);
    margin-left: 1em;
  }
  .selectField {
    height: 1.5rem;
    align-self: center;
    border-radius: 0.5rem;
    width: 50%;
    float: right;
    margin-right: calc(0.5em + 2px);
    margin-top: -2px;
    background-color: var(--bg-color);
  }
</style>
