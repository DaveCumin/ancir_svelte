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
  import { getFieldType } from "../data/handleData";
  import InPlaceEdit from "../utils/InPlaceEdit.svelte";
  import tippy from "tippy.js"; //https://atomiks.github.io/tippyjs/v6/getting-started/
  import "tippy.js/dist/tippy.css";

  function tippytip(node, params) {
    let tip = tippy(node, params);
    return {
      update: (newParams) => {
        tip.setProps(newParams);
      },
      destroy: () => {
        tip.destroy();
      },
    };
  }

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

  function createContext(id, fieldName) {
    $contextMenu = { labels: [], funcs: [] }; //reset the contextMenu
    const type = getFieldType(id, fieldName);
    const tempLabels = Object.keys(componentMap);
    for (let i = 0; i < tempLabels.length; i++) {
      if (componentMap[tempLabels[i]].forTypes.includes(type)) {
        //only add to the menu those processes appropriate for the type
        $contextMenu.labels[i] = tempLabels[i];
        $contextMenu.funcs[i] = () => addProcess(tempLabels[i], id, fieldName);
      }
    }
  }
</script>

<div id="dataTreeContainer" style="overflow: auto; height: 100%; width: auto;">
  <h1>Data Tables</h1>
  <div class="dataTree scroll-shadows">
    {#each $data as datum, datumID}
      <details open class="dataTable">
        <summary
          ><InPlaceEdit bind:value={datum.displayName} />

          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="deleteTable hoverbutton"
            on:click={(e) => {
              e.preventDefault();
              removeData(datum.id);
            }}
            use:tippytip={{
              content: "Delete " + datum.displayName,
              theme: "Ancir",
            }}
          >
            🗑️
          </div>
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="viewTable hoverbutton"
            on:click={(e) => {
              e.preventDefault();
              showDataTable(datum.id);
            }}
            use:tippytip={{
              content: "View/edit " + datum.displayName + " as table",
              theme: "Ancir",
            }}
          >
            📝
          </div>
        </summary>

        {#each Object.entries(datum.data) as [key, value] (key)}
          <details closed class="field">
            <summary>
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <InPlaceEdit bind:value={datum.data[key].name} />
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              {#if key.includes("processed")}
                <span
                  class="addbutton hoverbutton showContextMenu"
                  on:click={(e) => {
                    e.preventDefault();
                    createContext(datum.id, key);
                  }}
                  use:tippytip={{
                    content: "Add process to " + datum.data[key].name,
                    theme: "Ancir",
                  }}>+</span
                >
              {/if}
            </summary>
            {#if datum.data[key].type == "time"}
              Format: {datum.data[key].timeFormat}
              <br />
              Data: {datum.data[key].data[0]},{datum.data[key].data[1]}...
              <br />
              Time: {datum.data[key].timeData[0]},{datum.data[key]
                .timeData[1]}...
            {:else if key.includes("processed")}
              Data: {datum.data[key].data[0]},{datum.data[key].data[1]}...
              <br />
              {#each datum.data[key].processSteps as ps, psID}
                <details open class="process">
                  <summary
                    >{ps.process}
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div
                      class="deleteProcess hoverbutton"
                      on:click={(e) => {
                        e.preventDefault();
                        removeProcess(datum.id, key, psID);
                      }}
                    >
                      🗑️
                    </div>
                  </summary>

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
            {:else}
              Data: {datum.data[key].data[0]},{datum.data[key].data[1]}...
            {/if}
          </details>
        {/each}
      </details>
    {/each}
  </div>
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
    margin-right: 10px;
    box-shadow: 1px 1px 5px #888888;
  }

  .processDetails {
    padding: 0.5em;
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

  .deleteTable {
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
    float: right;
    cursor: pointer;
    margin-right: 0.5em;
  }
  .viewTable:hover {
    margin-right: 0em;
    cursor: pointer;
  }

  .deleteProcess {
    float: right;
    cursor: pointer;
    margin-right: 0em;
  }
</style>
