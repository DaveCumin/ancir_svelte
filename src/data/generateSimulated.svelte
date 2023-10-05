<script>
  import { data, menuModalActive } from "../store";
  import Slider from "../utils/Slider.svelte";

  function generateData(Ndays, fs_min, start, periods, maxheights) {
    // Create an empty data object for the new entry

    console.log(
      "making sim data: " +
        Ndays +
        " " +
        fs_min +
        " " +
        start +
        " " +
        periods +
        " " +
        maxheights
    );

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

    // Create time entry in newDataEntry.data
    newDataEntry.data.time = {
      name: "time",
      type: "time",
      data: timeData,
      processSteps: [],
      processedData: [],
    };

    // Generate value data (value0 and value1)
    for (let i = 0; i < periods.length; i++) {
      const valueKey = `value${i}`;
      const valueData = [];
      const max = maxheights[i];
      const periodMultiplier = periods[i];

      for (let j = 0; j < newDataEntry.datalength; j++) {
        const mult =
          j % (periodMultiplier * (60 / fs_min)) < 144 ? max * 0.05 : max;
        valueData.push(Math.round(Math.random() * mult));
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
    console.log(newDataEntry);
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

<div>
  <div>GENERATE SIMULATED DATA</div>
  <div>
    <label for="val">Days:</label>
    <input type="number" id="val" bind:value={Ndays} />
    <Slider min={1} max={100} bind:value={Ndays} />
  </div>
  <div>
    <label for="val">Sampling period (minutes):</label>
    <input type="number" id="val" bind:value={fs_min} />
    <Slider min={1} max={100} bind:value={fs_min} />
  </div>
  <div>
    <label for="val">Start time:</label>
    <input type="datetime-local" name="start" bind:value={start} />
  </div>
  <hr />
  <hr />
  {#each Array.from({ length: N_simulated }) as _, i}
    <div>value{i}:</div>
    <button class="removeSimDataButton" on:click={() => removeSimData(i)}>
      🗑️ <!-- Trash bin symbol -->
    </button>
    <div>
      <div>
        <label for="val">Rhythm period (hours):</label>
        <input type="number" id="val" bind:value={periods[i]} />
        <Slider min={21} max={26} step="0.1" bind:value={periods[i]} />
      </div>
      <div>
        <label for="val">Max values:</label>
        <input type="number" id="val" bind:value={maxheights[i]} />
        <Slider min={1} max={100} bind:value={maxheights[i]} />
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
</div>
