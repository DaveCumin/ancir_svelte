<script>
  // @ts-nocheck

  import Slider from "../../utils/Slider.svelte";
  import { data, graphs, activeGraphTab, graphTabs } from "../../store";
  import InPlaceEdit from "../../utils/InPlaceEdit.svelte";
  import {
    getFieldNames,
    removeGraphData,
    createnewDataForGraph,
  } from "../../data/handleData";
  import { getRandomHexColour } from "../AllCharts.js";

  import {
    defaultchartvalues,
    defaultother,
  } from "./Periodogram_defaults.svelte";
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
        <!-- END OF THE EXTRAS-->
      </details>
      <!-- The end of the data-->
    {/each}
  </div>
{/if}
