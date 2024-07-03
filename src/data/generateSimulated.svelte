<script>
  // @ts-nocheck
  import Dialog from "../components/Dialog.svelte";
  import { data, menuModalType } from "../store";
  import Slider from "../utils/Slider.svelte";
  import {
    forceFormat,
    guessDateofArray,
    getPeriod,
  } from "../utils/time/TimeUtils";
  import { DateTime } from "luxon";
  import { onMount } from "svelte";

  //create the first set of generated data on startup
  onMount(() => {
    generateData(
      28,
      15,
      DateTime.now()
        .set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        })
        .toJSDate(),
      [24, 28],
      [100, 150]
    );
  });

  function generateData(Ndays, fs_min, startDate, periods, maxheights) {
    // Create an empty data object for the new entry

    const newDataEntry = {
      id: $data.length, // Assign a unique ID
      importedFrom: `simulated(${Ndays},${maxheights[0]})`,
      displayName: `Simulated_${$data.length + 1}`,
      datalength: Ndays * 24 * (60 / fs_min),
      data: {},
    };

    //Make the time data
    const timeData = [];
    for (let i = 0; i < newDataEntry.datalength; i++) {
      const time = new Date(
        startDate.getTime() + i * fs_min * 60 * 1000
      ).toLocaleString("en-US");
      timeData.push(time);
    }

    const timefmt = guessDateofArray(timeData);
    const processedTimeData = forceFormat(timeData, timefmt);
    const timePeriod = getPeriod(timeData, timefmt);

    // Create time entry in newDataEntry.data
    newDataEntry.data.time = {
      name: "time",
      type: "time",
      data: timeData,
      timeData: processedTimeData,
      timeFormat: timefmt,
      recordPeriod: timePeriod,
    };

    // Generate value data (value0 and value1)
    for (let i = 0; i < periods.length; i++) {
      const valueKey = `generated_${i}`;
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
        name: `value${i}`,
        type: "value",
        data: valueData,
      };
    }

    // Add the newDataEntry to the data array
    data.update((currentData) => [...currentData, newDataEntry]);
    //close the modal
    $menuModalType = null;
  }

  let Ndays = 28;
  let fs_min = 15;
  let start = DateTime.now()
    .set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    .toJSDate();

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
      <input
        type="datetime-local"
        name="start"
        bind:value={start}
        on:change={(value) => console.log(value)}
      />
    </div>
    <hr />
    <h2>Data:</h2>
    <span class="addSimDataButton" on:click={() => addSimData()}>
      ➕ <!-- Plus sign symbol -->
    </span>
    {#each Array.from({ length: N_simulated }) as _, i}
      <div class="datum">
        <div class="dataTitle">
          <div>value{i}:</div>
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
      on:click={() => generateData(Ndays, fs_min, start, periods, maxheights)}
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
    display: inline-block;
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
