<script>
  // @ts-nocheck

  import Slider from "../../utils/Slider.svelte";
  import InPlaceEdit from "../../utils/InPlaceEdit.svelte";
  import Onset from "./Onset.svelte";
  import {
    getFieldNames,
    removeGraphData,
    createnewDataForGraph,
  } from "../../data/handleData";
  import { data, graphs, activeGraphTab, graphTabs } from "../../store";
  import { formatTimeFromISO } from "../../utils/time/TimeUtils";
  import { getRandomHexColour } from "../AllCharts.js";

  import { defaultchartvalues, defaultother } from "./Actigram_defaults.svelte";

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
      col: { hex: getRandomHexColour(), alpha: 0.5, rSquared: 0 },
      showLine: false,
    };
  }

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

{#if $activeGraphTab >= 0 && $graphs[$activeGraphTab].graph === "Actigram"}
  <div class="chartControls">
    <div class="sliderContainer">
      <span>Start time: </span>
      <!-- svelte-ignore a11y-no-static-element-interactions -->
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
            style="padding: 0.2em 0.5em; margin: -0.2em 0.2em;"
            on:click={(e) => {
              e.preventDefault();
              addOnset(sourceIndex);
            }}
          >
            📍
          </div>

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
          <details open class="field no-arrow">
            <summary
              >{key}:
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <!-- svelte-ignore a11y-click-events-have-key-events -->

              <span
                ><select
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
