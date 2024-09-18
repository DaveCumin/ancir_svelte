<script>
  // @ts-nocheck

  import Slider from "../../utils/Slider.svelte";
  import {
    data,
    graphs,
    graphTabs,
    activeGraphTab,
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
  import {
    addProcessToGraph,
    removeGraphProcess,
    updateGraphProcess,
    componentMap,
  } from "../../components/ProcessStep.svelte";
  import { getRandomHexColour } from "../AllCharts.js";

  import { defaultchartvalues, defaultother } from "./Raw_defaults.svelte";
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

{#if $activeGraphTab >= 0 && $graphs[$activeGraphTab].graph === "Raw"}
  <div class="chartControls">
    <div class="sliderContainer">
      <Slider
        min={100}
        max={1000}
        limits={[5, Infinity]}
        label="Width:"
        bind:value={$graphs[$activeGraphTab].params.width}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={10}
        max={3000}
        limits={[5, Infinity]}
        label="Height: "
        bind:value={$graphs[$activeGraphTab].params.height}
      />
    </div>

    <div class="sliderContainer">
      <label for="val">X-axis: </label>
      <input
        type="text"
        id="min"
        bind:value={$graphs[$activeGraphTab].params.xAxisLabel}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={-10}
        max={30}
        label="Min X:"
        bind:value={$graphs[$activeGraphTab].params.xDomainMin}
      />
    </div>
    <div class="sliderContainer">
      <Slider
        min={-10}
        max={30}
        label="Max X:"
        bind:value={$graphs[$activeGraphTab].params.xDomainMax}
      />
    </div>

    <div class="sliderContainer">
      <label for="val">Y-axis: </label>
      <input
        type="text"
        id="min"
        bind:value={$graphs[$activeGraphTab].params.yAxisLabel}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={-10}
        max={30}
        label="Min Y:"
        bind:value={$graphs[$activeGraphTab].params.yDomainMin}
      />
    </div>
    <div class="sliderContainer">
      <Slider
        min={-10}
        max={30}
        label="Max Y:"
        bind:value={$graphs[$activeGraphTab].params.yDomainMax}
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
      }}>+</span
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
          >
            🗑️
          </div>
        </summary>

        <div class="tableLabel">
          Table: {$data.find((entry) => entry.id === source.tableID)
            .displayName}
        </div>

        {#each Object.keys(source.chartvalues) as key}
          <details open class="field">
            <summary
              >{key}:
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <!-- svelte-ignore a11y-click-events-have-key-events -->

              <span
                ><div
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
                </select></span
              >
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

        <!-- Size-->
        <div class="itemsliderContainer">
          <Slider
            min="0.5"
            max="10"
            step="0.5"
            label="Size: "
            bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].size}
          />
        </div>

        <!-- Stroke width-->
        <div class="itemsliderContainer">
          <Slider
            min="0.5"
            max="10"
            step="0.5"
            label="Stroke width: "
            bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex]
              .strokeWidth}
          />
        </div>

        <!-- STROKE COLOUR-->
        <div class="colour">
          <input
            class="colourPicker"
            id={sourceIndex}
            type="color"
            style="background: {$graphs[$activeGraphTab].sourceData[sourceIndex]
              .strokeCol.hex}"
            bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex]
              .strokeCol.hex}
          />
          <div class="sliderContainer">
            <Slider
              min="0"
              max="1"
              step="0.01"
              limits={[0, 1]}
              label="Stroke alpha: "
              bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex]
                .strokeCol.alpha}
            />
          </div>
        </div>

        <!-- END OF THE EXTRAS-->
      </details>
      <!-- The end of the data-->
    {/each}
  </div>
{/if}
