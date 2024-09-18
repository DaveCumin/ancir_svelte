<script>
  // @ts-nocheck

  import Slider from "../../utils/Slider.svelte";
  import {
    data,
    graphs,
    activeGraphTab,
    graphTabs,
    contextMenu,
  } from "../../store";
  import InPlaceEdit from "../../utils/InPlaceEdit.svelte";
  import {
    getFieldNames,
    removeGraphData,
    createnewDataForGraph,
    getFieldTypeFromGraph,
    getDataFromSource,
    getRawData,
  } from "../../data/handleData";
  import { getRandomHexColour } from "../AllCharts.js";
  import {
    addProcessToGraph,
    removeGraphProcess,
    updateGraphProcess,
    componentMap,
  } from "../../components/ProcessStep.svelte";
  import {
    defaultchartvalues,
    defaultother,
  } from "./Periodogram_defaults.svelte";

  import tippy from "tippy.js"; //https://atomiks.github.io/tippyjs/v6/getting-started/

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

  function createContext(graphID, sourceID, keyIN) {
    const type = getFieldTypeFromGraph(graphID, sourceID, keyIN);
    const tempLabels = Object.keys(componentMap);
    for (let i = 0; i < tempLabels.length; i++) {
      if (componentMap[tempLabels[i]].forTypes.includes(type)) {
        //only add to the menu those processes appropriate for the type
        $contextMenu.labels[i] = tempLabels[i];
        $contextMenu.funcs[i] = () =>
          addProcessToGraph(tempLabels[i], graphID, sourceID, keyIN);
      }
    }
  }
</script>

{#if $activeGraphTab >= 0 && $graphs[$activeGraphTab].graph === "Periodogram"}
  <div class="chartControls">
    <div class="sliderContainer">
      <Slider
        min={10}
        max={$graphs[$activeGraphTab].params.maxPeriod}
        limits={[1, Infinity]}
        label="Min period:"
        bind:value={$graphs[$activeGraphTab].params.minPeriod}
      />
    </div>
    <div class="sliderContainer">
      <Slider
        min={$graphs[$activeGraphTab].params.minPeriod}
        max={30}
        limits={[1, Infinity]}
        label="Max period:"
        bind:value={$graphs[$activeGraphTab].params.maxPeriod}
      />
    </div>
    <div class="sliderContainer">
      <Slider
        min={0.1}
        max={1}
        step={0.01}
        limits={[0.1, 1]}
        label="Period step:"
        bind:value={$graphs[$activeGraphTab].params.stepPeriod}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={0.05}
        max={1}
        step="0.05"
        limits={[0.05, $graphs[$activeGraphTab].params.maxPeriod]}
        label="Bin size (hrs):"
        bind:value={$graphs[$activeGraphTab].params.binSizeHrs}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={100}
        max={1000}
        step="1"
        limits={[5, Infinity]}
        label="Width: "
        bind:value={$graphs[$activeGraphTab].params.width}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={10}
        max={30}
        step="1"
        limits={[5, Infinity]}
        label="Height:"
        bind:value={$graphs[$activeGraphTab].params.height}
      />
    </div>
  </div>

  <!-- ------------------- -->
  <!-- The Data -->
  <!-- ------------------- -->
  <div style="margin: 1em 1em 0 0;">
    <h1 style="display: inline;">{$graphTabs[$activeGraphTab].name} Data</h1>

    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span
      class="addbutton hoverbutton showContextMenu"
      on:click={(e) => {
        e.preventDefault();
        createnewDataForGraph(defaultchartvalues, defaultother);
      }}
      use:tippytip={{
        content: "Add data to graph",
        theme: "Ancir",
      }}>📊</span
    >
  </div>
  <!-- -->
  <div class="graphDataTree">
    {#each $graphs[$activeGraphTab].sourceData as source, sourceIndex}
      <details open class="dataTable">
        <summary
          ><InPlaceEdit bind:value={source.name} />

          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="deleteTable hoverbutton"
            on:click={(e) => {
              e.preventDefault();
              removeGraphData(sourceIndex);
            }}
            use:tippytip={{
              content: "Remove data from graph",
              theme: "Ancir",
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
          <details closed class="field">
            <summary
              >{key}:
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <!-- svelte-ignore a11y-click-events-have-key-events -->

              <span>
                <div
                  class="deleteTable hoverbutton showContextMenu"
                  on:click={(e) => {
                    e.preventDefault();
                    createContext(
                      $graphs[$activeGraphTab].id,
                      sourceIndex,
                      key
                    );
                  }}
                  use:tippytip={{
                    content: "Add process to " + key,
                    theme: "Ancir",
                  }}
                >
                  🛠️
                </div>

                <select
                  class="selectField"
                  bind:value={source.chartvalues[key].field}
                >
                  {#each getFieldNames(source) as fields}
                    <option value={fields}
                      >{$data[$data.findIndex((d) => d.id === source.tableID)]
                        .data[fields].name}</option
                    >
                  {/each}
                </select>
              </span>
            </summary>
            {#each source.chartvalues[key].processSteps as ps, psID}
              <details open class="process">
                <summary
                  >{ps.process}
                  <!-- svelte-ignore a11y-no-static-element-interactions -->
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <div
                    class="deleteProcess hoverbutton"
                    on:click={(e) => {
                      e.preventDefault();
                      removeGraphProcess(
                        $graphs[$activeGraphTab].id,
                        sourceIndex,
                        key,
                        psID
                      );
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
                      type: getFieldTypeFromGraph(
                        $graphs[$activeGraphTab].id,
                        sourceIndex,
                        key
                      ),
                    }}
                    dataIN={getRawData(
                      sourceIndex,
                      $graphs[$activeGraphTab].sourceData[sourceIndex]
                        .chartvalues[key]
                    )}
                    on:update={(event) =>
                      updateGraphProcess(
                        $graphs[$activeGraphTab].id,
                        sourceIndex,
                        key,
                        psID,
                        event.detail.params
                      )}
                  />
                </div>
              </details>
            {/each}
          </details>
        {/each}
        <!-- EXTRAS-->
        <!-- COLOUR-->
        <div class="colour">
          <input
            class="colourPicker"
            id={sourceIndex}
            type="color"
            style="background: {$graphs[$activeGraphTab].sourceData[sourceIndex]
              .col.hex}"
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
              bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].col
                .alpha}
            />
          </div>
        </div>
        <!-- END OF THE EXTRAS-->
      </details>
      <!-- The end of the data-->
    {/each}
  </div>
{/if}
