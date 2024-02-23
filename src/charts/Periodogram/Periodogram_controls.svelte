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
  import {
    updateProcess,
    removeProcess,
    updateGraphProcess,
    addProcessToGraphData,
    componentMap,
  } from "../../components/ProcessStep.svelte";

  const prototypechartvalues = { time: "time", values: "values" };
  const prototypeother = {
    col: { hex: "#1B1D50", alpha: 0.5 },
  };
</script>

{#if $activeGraphTab >= 0 && $graphs[$activeGraphTab].graph === "periodogram"}
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
        <!-- END OF THE EXTRAS-->
      </details>
      <!-- The end of the data-->
    {/each}
  </div>
{/if}
