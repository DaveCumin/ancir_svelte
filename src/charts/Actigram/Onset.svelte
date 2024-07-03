<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab } from "../../store";
  import Slider from "../../utils/Slider.svelte";
  import Sliderdouble from "../../utils/Sliderdouble.svelte";

  export let sourceIndex = 0;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-missing-attribute -->
{#each $graphs[$activeGraphTab].sourceData[sourceIndex].onsets as _, o}
  <div class="otherItemDetail">
    <div class="itemsliderContainer">
      <select
        name="onsettype"
        style="float: none;"
        bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
          .type}
      >
        <option value="onset">Onset</option>
        <option value="offset">Offset</option>
        <!-- <option value="acrophase">Acrophase</option>-->
      </select>
      <br />
      <label>show:</label><input
        type="checkbox"
        bind:checked={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
          .showOnsets}
      />
      <span
        style="cursor:text"
        on:click={(e) => {
          e.preventDefault();
        }}
        >Est τ: {(
          $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].lmFit
            .slope *
            $graphs[$activeGraphTab].params.periodHrs +
          $graphs[$activeGraphTab].params.periodHrs
        ).toFixed(2)} hrs</span
      >
      <div class="onsetRange">
        <Sliderdouble
          minValue="1"
          maxValue={$graphs[$activeGraphTab].chartData.data[0].scaleLimits
            .length}
          step="1"
          bind:min={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
            .filterStart}
          bind:max={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
            .filterEnd}
        />
      </div>
      <div class="colour">
        <input
          class="colourPicker"
          id={sourceIndex}
          type="color"
          style="background: {$graphs[$activeGraphTab].sourceData[sourceIndex]
            .onsets[o].col.hex}"
          bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
            .col.hex}
        />

        <div class="sliderContainer">
          <Slider
            min="0"
            max="1"
            step="0.01"
            limits={[0, 1]}
            label="Alpha: "
            bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[
              o
            ].col.alpha}
          />
        </div>
      </div>
      <div>
        <label>Show Line</label><input
          type="checkbox"
          bind:checked={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[
            o
          ].showLine}
        />
      </div>
      <details>
        <summary>
          <label>Advanced</label>
        </summary>
        <div style="padding:5px">
          <Slider
            min="0"
            max="100"
            step="1"
            limits={[0, 100]}
            label="Centile threshold: "
            bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[
              o
            ].centileThresh}
          />
        </div>
        <div style="padding:5px">
          <Slider
            min="0"
            max="10"
            step="1"
            limits={[0, 100]}
            label="Template hours before: "
            bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[
              o
            ].N}
          />
        </div>
        <div style="padding:5px">
          <Slider
            min="0"
            max="10"
            step="1"
            limits={[0, 100]}
            label="Template hours after: "
            bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[
              o
            ].M}
          />
        </div>
      </details>
    </div>
  </div>
{/each}
