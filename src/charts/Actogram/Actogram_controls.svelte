<script>
  // @ts-nocheck

  import Slider from "../../utils/Slider.svelte";
  import InPlaceEdit from "../../utils/InPlaceEdit.svelte";
  import Onset from "./Onset.svelte";
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
  import {
    data,
    graphs,
    activeGraphTab,
    graphTabs,
    contextMenu,
  } from "../../store";
  import { formatTimeFromISO } from "../../utils/time/TimeUtils";
  import { getRandomHexColour } from "../AllCharts.js";
  import { DateTime } from "luxon";
  import { calculateTimeDifference } from "../../utils/time/TimeUtils";
  import {
    defaultchartvalues,
    defaultother,
    defaultAnnotation,
  } from "./Actogram_defaults.svelte";
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

  function addOnset(sourceIndex) {
    $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[
      $graphs[$activeGraphTab].sourceData[sourceIndex].onsets.length
    ] = {
      type: "onset",
      showOnsets: true,
      excludeOnsets: [],
      MAD: 2,
      filterStart: 1,
      filterEnd: $graphs[$activeGraphTab].chartData.data[0].scaleLimits.length,
      centileThresh: 80,
      M: 3,
      N: 3,
      lmFit: { slope: 0, intercept: 0, rSquared: 0 },
      col: { hex: getRandomHexColour(), alpha: 0.5 },
      showLine: false,
    };
  }

  function addAnnotation() {
    const anLen = $graphs[$activeGraphTab].chartData?.annotations.length;
    console.log(anLen);
    $graphs[$activeGraphTab].chartData.annotations[anLen] = defaultAnnotation;

    console.log($graphs[$activeGraphTab].chartData);
  }
  function removeAnnotation(idx) {}

  let datePickVisible = true;

  //TODO_med: something not quite right with the datepicker. Also, it doesn't update the graph when changed.
  function toggleOpenDatePick() {
    datePickVisible = !datePickVisible;

    const datePickLabel = document.querySelector(".datepicklabel");
    const dateInput = document.querySelector(".dateInput");

    if (datePickVisible) {
      datePickLabel.style.display = "inline-block";
      dateInput.style.width = "0px";
      dateInput.style.height = "0px";
    } else {
      datePickLabel.style.display = "none";
      dateInput.style.width = "60%";
      dateInput.style.height = "100%";
    }
  }
</script>

{#if $activeGraphTab >= 0 && $graphs[$activeGraphTab].graph === "Actogram"}
  <div class="chartControls">
    <div class="sliderContainer">
      <span>Start time: </span>
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="datepicklabel datepicklabelshow"
        style="display: inline-block; 
      margin-right: 2px; 
      margin-left: auto;
      text-align: center;"
        on:click={(e) => {
          toggleOpenDatePick();
        }}
      >
        {formatTimeFromISO($graphs[$activeGraphTab].params.startTime)}
      </div>
      <input
        class="dateInput"
        style="
      width: 0px;
      height: 0px;"
        type="datetime-local"
        id="startTime"
        name="startTime"
        bind:value={$graphs[$activeGraphTab].params.startTime}
        on:change={(e) => {
          console.log("value = " + e.target.value);
          console.log("pre st = " + $graphs[$activeGraphTab].params.startTime);
        }}
        on:keydown={(e) => {
          if (e.key === "Enter") {
            toggleOpenDatePick();
          }
        }}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={10}
        max={40}
        limits={[1, Infinity]}
        label="Period (hrs):"
        bind:value={$graphs[$activeGraphTab].params.periodHrs}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={0.05}
        max={1}
        step="0.05"
        limits={[0.05, $graphs[$activeGraphTab]?.params.periodHrs]}
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
        label="Row Height:"
        bind:value={$graphs[$activeGraphTab].params.dayHeight}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={1}
        max={20}
        step="1"
        limits={[-$graphs[$activeGraphTab]?.params.dayHeight, Infinity]}
        label="Between gap:"
        bind:value={$graphs[$activeGraphTab].params.betweenHeight}
      />
    </div>

    <div class="sliderContainer">
      <!-- svelte-ignore a11y-missing-attribute -->
      <a style="align-self: center;">Show y-axes: </a>
      <input
        type="checkbox"
        bind:checked={$graphs[$activeGraphTab].params.showAxes}
      />
    </div>
    <div class="sliderContainer">
      <!-- svelte-ignore a11y-missing-attribute -->
      <a style="align-self: center;">Scale: </a>
      <select
        class="selectField"
        style="margin-right:0 !important;"
        bind:value={$graphs[$activeGraphTab].params.scaleAxes}
      >
        <option value="byPlot">By row</option>
        <option value="overall">Overall</option>
      </select>
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

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span
      class="addbutton hoverbutton showContextMenu"
      on:click={(e) => {
        e.preventDefault();
        addAnnotation();
      }}
      use:tippytip={{
        content: "Add annotation to graph",
        theme: "Ancir",
      }}>✍</span
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
            class="addOnset hoverbutton"
            style="padding: 0.2em 0.5em; margin: -0.2em 0.2em; float: right;"
            on:click={(e) => {
              e.preventDefault();
              addOnset(sourceIndex);
            }}
            use:tippytip={{
              content: "Add onsets",
              theme: "Ancir",
            }}
          >
            📍
          </div>

          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="deleteTable hoverbutton"
            on:click={(e) => {
              e.preventDefault();
              removeGraphData(sourceIndex);
            }}
            use:tippytip={{
              content: "Delete data from graph",
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

        <!-- ONSETS-->
        <Onset {sourceIndex} />

        <!-- END OF THE EXTRAS-->
      </details>
      <!-- The end of the data-->
    {/each}
    <!-- ANNOTATIONS-->
    {#each $graphs[$activeGraphTab].chartData?.annotations as an, ai}
      <details open class="dataTable">
        <summary><InPlaceEdit bind:value={an.name} /> </summary>
        <div>
          <span>Start: </span>
          <input
            class="dateInput"
            type="datetime-local"
            bind:value={$graphs[$activeGraphTab].chartData.annotations[ai]
              .startTime}
          />
        </div>
        <div
          class="sliderContainer"
          style="
        margin-left: 2em;
    "
        >
          <Slider
            min={0}
            max={5}
            step={0.1}
            limits={[0, Infinity]}
            label="Length (hrs):"
            bind:value={$graphs[$activeGraphTab].chartData.annotations[ai]
              .lengthHrs}
          />
        </div>

        <div class="colour">
          <input
            class="colourPicker"
            id={ai}
            type="color"
            style="background: {an.col.hex}"
            bind:value={$graphs[$activeGraphTab].chartData.annotations[ai].col
              .hex}
          />
          <div class="sliderContainer">
            <Slider
              min="0"
              max="1"
              step="0.01"
              limits={[0, 1]}
              label="Alpha: "
              bind:value={$graphs[$activeGraphTab].chartData.annotations[ai].col
                .alpha}
            />
          </div>
        </div>
      </details>
    {/each}
  </div>
{/if}

<style>
  .datepicklabelshow {
    display: inline-block;
  }
  .datepicklabel {
    display: none;
    cursor: pointer;
  }

  .dateInput:hover {
    background: #eee;
  }

  ::-webkit-calendar-picker-indicator:hover {
    cursor: pointer;
  }
</style>
