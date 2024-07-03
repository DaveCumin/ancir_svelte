<script>
  // @ts-nocheck

  import Slider from "../../utils/Slider.svelte";
  import { data, graphs, graphTabs, activeGraphTab } from "../../store";
  import InPlaceEdit from "../../utils/InPlaceEdit.svelte";
  import {
    getFieldNames,
    removeGraphData,
    createnewDataForGraph,
  } from "../../data/handleData";
  import { getRandomHexColour } from "../AllCharts.js";

  const prototypechartvalues = { x: "time", y: "values" };
  const prototypeother = {
    col: { hex: getRandomHexColour(), alpha: 0.5 },
    size: 2,
    strokeWidth: 1,
    strokeCol: { hex: getRandomHexColour(), alpha: 0.9 },
  };
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
