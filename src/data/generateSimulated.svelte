<script>
  // @ts-nocheck

  import { data, menuModalActive } from "../store";
  import Slider from "../utils/Slider.svelte";
  import { forceFornat, guessDateofArray } from "../utils/time/TimeUtils";
  import { onMount } from "svelte";

  //create the first set of generated data on startup
  onMount(() => {
    generateData(28, 15, new Date(), [24, 28], [100, 150]);
  });

  function generateData(Ndays, fs_min, start, periods, maxheights) {
    // Create an empty data object for the new entry

    const newDataEntry = {
      id: $data.length, // Assign a unique ID
      importedFrom: `simulated(${Ndays},${maxheights[0]})`,
      displayName: `Simulated_${$data.length + 1}`,
      datalength: Ndays * 24 * (60 / fs_min),
      data: {},
    };

    // Generate time data
    const startDate = new Date(start);
    const timeData = [];
    for (let i = 0; i < newDataEntry.datalength; i++) {
      const time = new Date(
        startDate.getTime() + i * fs_min * 60 * 1000
      ).toLocaleString("en-US");
      timeData.push(time);
    }

    const timefmt = guessDateofArray(timeData);
    const processedTimeData = forceFornat(timeData, timefmt);

    // Create time entry in newDataEntry.data
    newDataEntry.data.time = {
      name: "time",
      type: "time",
      data: timeData,
      timeData: processedTimeData,
      processSteps: [],
      processedData: [],
      timeFormat: timefmt,
    };

    // Generate value data (value0 and value1)
    for (let i = 0; i < periods.length; i++) {
      const valueKey = `value${i}`;
      const valueData = [];
      const max = maxheights[i];
      const period = periods[i];
      const periodL = period * (60 / fs_min); //the length of the period
      for (let j = 0; j < newDataEntry.datalength; j++) {
        const isLowPeriod = j % periodL < periodL / 2;
        const mult = isLowPeriod ? max * 0.05 : max;

        // Generate random value between 0 and mult
        const randomValue = Math.random() * mult;
        valueData.push(Math.round(randomValue));
      }

      // Create value entry in newDataEntry.data
      newDataEntry.data[valueKey] = {
        name: valueKey,
        type: "value",
        data: valueData,
        processSteps: [],
        processedData: [],
      };
    }

    // Add the newDataEntry to the data array
    data.update((currentData) => [...currentData, newDataEntry]);
    //close the modal
    $menuModalActive = false;
  }

  let Ndays = 28;
  let fs_min = 15;
  let start = new Date("01/01/2024 11:10");

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
</script>

{#if $menuModalActive}
  <dialog id="modal_simulated_data" class="dialog">
    <div class="modal-box">
      <h1>GENERATE SIMULATED DATA</h1>
      <div>
        <Slider min={1} max={100} bind:value={Ndays} label="Days:" />
      </div>
      <div>
        <Slider
          min={1}
          max={100}
          bind:value={fs_min}
          label="Sampling period (minutes):"
        />
      </div>
      <div>
        <label for="val">Start time:</label>
        <input type="datetime-local" name="start" bind:value={start} />
      </div>
      <hr />
      <hr />
      {#each Array.from({ length: N_simulated }) as _, i}
        <div>value{i}:</div>
        <button on:click={() => removeSimData(i)}>
          🗑️ <!-- Trash bin symbol -->
        </button>
        <div>
          <div>
            <Slider
              min={21}
              max={26}
              step="0.1"
              bind:value={periods[i]}
              label="Rhythm period (hours):"
            />
          </div>
          <div>
            <Slider
              min={1}
              max={100}
              bind:value={maxheights[i]}
              label="Max values:"
            />
          </div>
        </div>
        <hr />
      {/each}
      <button class="addSimDataButton" on:click={() => addSimData()}>
        ➕ <!-- Plus sign symbol -->
      </button>
      <button
        on:click={() => generateData(Ndays, fs_min, start, periods, maxheights)}
        >Generate</button
      >
      <button on:click={() => ($menuModalActive = false)}>Close</button>
    </div>
  </dialog>
{/if}

<style>
  dialog {
    display: block;
    position: absolute;
    top: 10vh;
    z-index: 1000;
    max-height: 80vh;
    overflow: auto;
  }
  .modal {
    z-index: 1000;
    opacity: 1;
    max-height: 75%;
  }
  .modal-box {
    z-index: 1000;
  }
</style>
