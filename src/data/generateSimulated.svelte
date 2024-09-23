<script>
  // @ts-nocheck
  import Dialog from "../components/Dialog.svelte";
  import { data, menuModalType } from "../store";
  import Slider from "../utils/Slider.svelte";
  import { DateTime } from "luxon";
  import DateTimeSelect from "../utils/time/DateTimeSelect.svelte";
  import { generateData } from "./simulate";

  let Ndays = 28;
  let fs_min = 15;
  let start = DateTime.fromISO(
    DateTime.now().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
  );

  let N_simulated = 2;
  let periods = [24, 25];
  let maxheights = [200, 400];

  function removeSimData(i) {
    N_simulated -= 1;
    periods.slice(i, 1);
    maxheights.slice(i, 1);
  }
  function addSimData() {
    N_simulated += 1;
    periods.push(24);
    maxheights.push(100);
  }

  function handleGenerateData(Ndays, fs_min, start, periods, maxheights) {
    console.log(start);
    console.log(start.toJSDate());
    const newDataEntry = generateData(
      Ndays,
      fs_min,
      start.toJSDate(),
      periods,
      maxheights,
      $data.length
    );
    // Add the newDataEntry to the data array using `data.update`
    $data = [...$data, newDataEntry];

    // Close the modal
    $menuModalType = null; // Properly set the modal to null
  }
</script>

{#if $menuModalType === "generateSim"}
  <Dialog title="GENERATE SIMULATED DATA">
    <div>
      <Slider
        min={5}
        max={30}
        limits={[1, Infinity]}
        bind:value={Ndays}
        label="Days:"
      />
    </div>
    <div>
      <Slider
        min={1}
        max={240}
        step={1}
        limits={[1, 240]}
        bind:value={fs_min}
        label="Sampling period (minutes):"
      />
    </div>
    <div>
      <label for="val">Start time:</label>
      <div
        style="
      vertical-align: top;
      float: right;
  "
      >
        <DateTimeSelect label="" bind:thedatetime={start} />
      </div>
    </div>
    <hr />
    <h2>Data:</h2>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span class="addSimDataButton" on:click={() => addSimData()}>
      ➕ <!-- Plus sign symbol -->
    </span>
    {#each Array.from({ length: N_simulated }) as _, i}
      <div class="datum">
        <div class="dataTitle">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div>value{i}:</div>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div class="removeData hoverbutton" on:click={() => removeSimData(i)}>
            🗑️ <!-- Trash bin symbol -->
          </div>

          <div>
            <div>
              <Slider
                min={21}
                max={26}
                limits={[6, 72]}
                step="0.1"
                bind:value={periods[i]}
                label="Rhythm period (hours):"
              />
            </div>
            <div>
              <Slider
                min={1}
                max={100}
                limits={[10, 10000]}
                bind:value={maxheights[i]}
                label="Max values:"
              />
            </div>
          </div>
        </div>
      </div>
    {/each}

    <button
      on:click={() =>
        handleGenerateData(Ndays, fs_min, start, periods, maxheights)}
      >Generate</button
    >
  </Dialog>
{/if}

<style>
  .addSimDataButton {
    float: right;
    margin-top: -2.2em;
  }
  .addSimDataButton:hover {
    background: var(--hover-color);
    padding: 0.2em 0.5em;
    margin: -2.4em -0.5em;
    border-radius: 20%;
    cursor: pointer;
  }
  .dataTitle {
    margin-top: 10px;
  }
  .datum {
    box-shadow: 1px 1px 5px var(--secondary-color);
    padding: 2px 10px;
    margin: 0 0px 10px 0px;
  }
  .removeData {
    float: right;
    cursor: pointer;
    margin-top: -1.3em;
  }
  .hoverbutton:hover {
    background: var(--hover-color);
    padding: 0.2em 0.5em;
    margin: -1.5em -0.5em;
    border-radius: 20%;
    cursor: pointer;
  }
</style>
