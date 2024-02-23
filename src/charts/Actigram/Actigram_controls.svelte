<script>
  // @ts-nocheck

  import Slider from "../../utils/Slider.svelte";
  import InPlaceEdit from "../../utils/InPlaceEdit.svelte";
  import {
    getFieldNames,
    removeGraphData,
    createnewDataForGraph,
  } from "../../data/handleData";
  import {
    updateProcess,
    removeProcess,
    updateGraphProcess,
    addProcessToGraphData,
    componentMap,
  } from "../../components/ProcessStep.svelte";
  import { data, graphs, activeGraphTab, graphTabs } from "../../store";
  import { formatTimeFromISO } from "../../utils/time/TimeUtils";

  const prototypechartvalues = { time: "time", values: "values" };
  const prototypeother = {
    col: { hex: "#1B1D50", alpha: 0.5 },
    showOnsets: true,
  };

  let datePickVisible = true;

  function toggleOpenDatePick() {
    datePickVisible = !datePickVisible;

    const datePickLabel = document.querySelector(".datepicklabel");
    const dateInput = document.querySelector(".dateInput");

    if (datePickVisible) {
      datePickLabel.style.display = "inline-block";
      dateInput.style.width = "18px"; // Set the width back to auto or any other desired value
    } else {
      datePickLabel.style.display = "none";
      dateInput.style.width = "60%";
    }
  }
</script>

{#if $activeGraphTab >= 0 && $graphs[$activeGraphTab].graph === "actigram"}
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
        on:dblclick={(e) => {
          toggleOpenDatePick();
        }}
      >
        {formatTimeFromISO($graphs[$activeGraphTab].params.startTime)}
      </div>
      <input
        class="dateInput"
        type="datetime-local"
        id="startTime"
        name="startTime"
        bind:value={$graphs[$activeGraphTab].params.startTime}
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
        label="Day Height:"
        bind:value={$graphs[$activeGraphTab].params.dayHeight}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={1}
        max={20}
        step="1"
        limits={[-$graphs[$activeGraphTab]?.params.dayHeight, Infinity]}
        label="Between Height:"
        bind:value={$graphs[$activeGraphTab].params.betweenHeight}
      />
    </div>

    <div class="sliderContainer">
      <!-- svelte-ignore a11y-missing-attribute -->
      <a>y-Axes: </a>
      <!-- svelte-ignore a11y-missing-attribute -->
      <a>Show </a>
      <input
        type="checkbox"
        bind:checked={$graphs[$activeGraphTab].params.showAxes}
      />
      <a>Scale </a>
      <select
        class="selectField"
        style="margin-right:0 !important;"
        bind:value={$graphs[$activeGraphTab].params.scaleAxes}
      >
        <option value="byPlot">By row / plot</option>
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
        createnewDataForGraph(prototypechartvalues, prototypeother);
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
          <details
            open
            class="field {source.chartvalues[key].processSteps.length > 0
              ? ''
              : 'no-arrow'}"
          >
            <summary
              >{key}:
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <span
                class="addbutton hoverbutton showContextMenu"
                on:click={(e) => {
                  e.preventDefault();
                  addProcessToGraphData("graph", sourceIndex, key);
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
                  <!-- svelte-ignore a11y-no-static-element-interactions -->
                  <!-- svelte-ignore a11y-no-static-element-interactions -->
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
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
        <!-- svelte-ignore a11y-missing-attribute -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <div class="itemsliderContainer">
          <details class="otherItemDetail">
            <summary>
              <a>Onsets</a>
              <input
                type="checkbox"
                bind:checked={$graphs[$activeGraphTab].sourceData[sourceIndex]
                  .showOnsets}
              />
              <span
                >Est τ: {$graphs[$activeGraphTab].chartData.data[sourceIndex]
                  .estimate}</span
              >
            </summary>
            <div style="padding:5px">
              <Slider
                min="0"
                max="100"
                step="1"
                limits={[0, 100]}
                label="Centile threshold: "
                bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex]
                  .centileThresh}
              />
            </div>
            <div style="padding:5px">
              <Slider
                min="0"
                max="10"
                step="1"
                limits={[0, 100]}
                label="M: "
                bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].M}
              />
            </div>
            <div style="padding:5px">
              <Slider
                min="0"
                max="10"
                step="1"
                limits={[0, 100]}
                label="N: "
                bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].N}
              />
            </div>
          </details>
        </div>

        <!-- END OF THE EXTRAS-->
      </details>
      <!-- The end of the data-->
    {/each}
  </div>
{/if}

<style>
  .dateInput {
    margin-right: 2px;
    width: 18px;
    padding-right: 4px;
    margin-bottom: 5px;
    margin-top: -3px;
    padding-top: 2px;
    background: var(--primary-color);
    cursor: pointer;
  }

  .datepicklabelshow {
    display: inline-block;
  }
  .datepicklabel {
    display: none;
  }

  .dateInput:hover {
    background: #eee;
  }

  ::-webkit-calendar-picker-indicator:hover {
    cursor: pointer;
  }
</style>
