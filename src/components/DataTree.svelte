<script>
  // @ts-nocheck
  import {
    data,
    dataIDsforTables,
    showalldata,
    activeTableTab,
    graphs,
    contextMenu,
  } from "../store";
  import {
    addProcess,
    updateDataProcess,
    componentMap,
  } from "./ProcessStep.svelte";
  import InPlaceEdit from "../utils/InPlaceEdit.svelte";

  //show the data in tables
  function showDataTable(ID) {
    const tab = $dataIDsforTables.indexOf(ID);
    if (tab < 0) {
      //tab not there
      $dataIDsforTables.push(ID);
      $dataIDsforTables = $dataIDsforTables;

      $showalldata.push(false);
      $showalldata = $showalldata;

      $activeTableTab = $dataIDsforTables.length - 1;
    } else {
      //tab
      $activeTableTab = tab;
    }
  }

  function updateProcess(dataID, datakey, processindex, processParams) {
    let dataIndex = $data.findIndex((d) => d.id === dataID);
    $data[dataIndex].data[datakey].processSteps[processindex].parameters =
      processParams;
    updateDataProcess(dataID, datakey);
  }

  function removeProcess(dataID, datakey, processindex) {
    let dataIndex = $data.findIndex((d) => d.id === dataID);
    $data[dataIndex].data[datakey].processSteps.splice(processindex, 1);
    updateDataProcess(dataID, datakey);
    if ($data[dataIndex].data[datakey].processSteps.length === 0) {
      $data[dataIndex].data[datakey].processedData = [];
    }
  }

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

  function createContext(where, id, fieldName) {
    $contextMenu.labels = Object.keys(componentMap);
    for (let i = 0; i < $contextMenu.labels.length; i++) {
      $contextMenu.funcs[i] = () =>
        addProcess($contextMenu.labels[i], where, id, fieldName);
    }
  }
</script>

<h1>Data Tables</h1>
<div class="dataTree scroll-shadows">
  {#each $data as datum, datumID}
    <details open class="dataTable">
      <summary
        ><InPlaceEdit bind:value={datum.displayName} />

        <div
          class="deleteTable hoverbutton"
          on:click={(e) => {
            e.preventDefault();
            removeData(datum.id);
          }}
        >
          🗑️
        </div>
        <div
          class="viewTable hoverbutton"
          on:click={(e) => {
            e.preventDefault();
            showDataTable(datum.id);
          }}
        >
          🔎
        </div></summary
      >

      {#each Object.entries(datum.data) as [key, value] (key)}
        <details
          open
          class="field {datum.data[key].processSteps.length > 0
            ? ''
            : 'no-arrow'}"
        >
          <summary
            ><InPlaceEdit bind:value={datum.data[key].name} /><span
              class="addbutton hoverbutton showContextMenu"
              on:click={(e) => {
                e.preventDefault();
                createContext("data", datum.id, key);
              }}>+</span
            ></summary
          >
          {#each datum.data[key].processSteps as ps, psID}
            <details open class="process">
              <summary
                >{ps.process}
                <div
                  class="deleteProcess hoverbutton"
                  on:click={(e) => {
                    e.preventDefault();
                    removeProcess(datum.id, key, psID);
                  }}
                >
                  🗑️
                </div></summary
              >

              <div class="processDetails">
                <svelte:component
                  this={componentMap[ps.process].component}
                  paramsStart={ps.parameters}
                  typeTime={{
                    type: $data[datumID].data[key].type,
                    tocheck: { tableID: datum.id, key: key },
                  }}
                  on:update={(event) =>
                    updateProcess(datum.id, key, psID, event.detail.params)}
                />
              </div>
            </details>
          {/each}
        </details>
      {/each}
    </details>
  {/each}
</div>

<style>
  .dataTree {
    width: calc(100% - 6px);
    border-radius: 0;
    margin-left: 1px;
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
</style>
