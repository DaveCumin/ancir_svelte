<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab } from "../../store";
  import Slider from "../../utils/Slider.svelte";
  import Sliderdouble from "../../utils/Sliderdouble.svelte";
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

  export let sourceIndex = 0;
  let addingMarker = false;

  function removeOnsetData(sourceIndex, o) {
    $graphs[$activeGraphTab].sourceData[sourceIndex].onsets.splice(o, 1);
    $graphs[$activeGraphTab].chartData.onsets[sourceIndex].splice(o, 1);
    $graphs = $graphs;
  }

  function addingManualMarker(sourceIndex, o) {
    if ($graphs[$activeGraphTab]?.semaphore?.text == "addingManualMarker") {
      console.log("Already adding one; do nothing.");
    } else {
      $graphs[$activeGraphTab].semaphore = {
        text: "addingManualMarker",
        sourceIndex: sourceIndex,
        o: o,
      };
      document.body.style.cursor = "crosshair";
    }
    console.log($graphs[$activeGraphTab]);
  }
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-missing-attribute -->
{#each $graphs[$activeGraphTab].sourceData[sourceIndex]?.onsets as _, o}
  <div class="otherItemDetail">
    <div class="itemsliderContainer">
      <select
        name="onsettype"
        style="float: none;"
        bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
          .type}
        on:change={(e) => {
          console.log("changed to: ", e.target.value);
          console.log("onset number: ", o);
          if (e.target.value == "manual") {
            console.log("resetting onsetTimes");
            //if it's changing to manual, reset the points
            $graphs[$activeGraphTab].chartData.onsets[sourceIndex][
              o
            ].onsetTimes = [];
          }
        }}
      >
        <option value="onset">Onset</option>
        <option value="offset">Offset</option>
        <option value="manual">Manual</option>
        <!-- <option value="acrophase">Acrophase</option>-->
      </select>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="deleteTable hoverbutton"
        on:click={(e) => {
          e.preventDefault();
          removeOnsetData(sourceIndex, o);
        }}
        use:tippytip={{
          content: "Delete onsets",
          theme: "Ancir",
        }}
      >
        🗑️
      </div>
      <br />
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>show:</label><input
        type="checkbox"
        bind:checked={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
          .showOnsets}
      />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span
        style="cursor:text"
        on:click={(e) => {
          e.preventDefault();
        }}
        >Est τ: {(
          $graphs[$activeGraphTab].chartData.onsets[sourceIndex][o].lmFit
            .slope *
            $graphs[$activeGraphTab].params.periodHrs +
          $graphs[$activeGraphTab].params.periodHrs
        ).toFixed(2)} hrs</span
      >
      {#if $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].type != "manual"}
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
      {/if}
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
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Show Line</label><input
          type="checkbox"
          bind:checked={$graphs[$activeGraphTab].sourceData[sourceIndex].onsets[
            o
          ].showLine}
        />
        <br />
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span
          style="cursor:text"
          on:click={(e) => {
            e.preventDefault();
          }}
          >R-squared: {$graphs[$activeGraphTab].chartData.onsets[sourceIndex][
            o
          ].lmFit.rSquared.toFixed(2)}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
        </span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span
          style="cursor:text"
          on:click={(e) => {
            e.preventDefault();
          }}
          >Error: {$graphs[$activeGraphTab].chartData.onsets[sourceIndex][
            o
          ].lmFit.rmse.toFixed(2)}
        </span>
      </div>
      {#if $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].type == "manual"}
        <div
          class="hoverbutton"
          style=" width: 1.1em; height: 1.1em;"
          on:click={(e) => {
            e.preventDefault();
            addingManualMarker(sourceIndex, o);
          }}
          use:tippytip={{
            content: "Add marker",
            theme: "Ancir",
          }}
        >
          📍
        </div>
      {:else}
        <details>
          <summary>
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>Advanced</label>
          </summary>
          <div style="padding:5px">
            <Slider
              min="0"
              max="100"
              step="1"
              limits={[0, 100]}
              label="Centile threshold: "
              bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex]
                .onsets[o].centileThresh}
            />
          </div>
          <div style="padding:5px">
            <Slider
              min="0"
              max="10"
              step="1"
              limits={[0, 100]}
              label="Template hours before: "
              bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex]
                .onsets[o].N}
            />
          </div>
          <div style="padding:5px">
            <Slider
              min="0"
              max="10"
              step="1"
              limits={[0, 100]}
              label="Template hours after: "
              bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex]
                .onsets[o].M}
            />
          </div>
          <div style="padding:5px">
            <Slider
              min="0"
              max="10"
              step="0.25"
              limits={[0, 10]}
              label="MAD threshold to exclude: "
              bind:value={$graphs[$activeGraphTab].sourceData[sourceIndex]
                .onsets[o].MAD}
            />
          </div>
        </details>
      {/if}
    </div>
  </div>
{/each}
