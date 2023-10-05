<script>
  import { data } from "../store";

  function generateData(Ndays, fs_min, start, period, maxheight) {
    // Create an empty data object for the new entry

    const newDataEntry = {
      id: $data.length, // Assign a unique ID
      importedFrom: `simulated(${Ndays},${maxheight[0]})`,
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
    for (let i = 0; i < 2; i++) {
      const valueKey = `value${i}`;
      const valueData = [];
      const max = maxheight[i];
      const periodMultiplier = period[i];

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
  }
</script>

<div>
  <div>GENERATE SIMULATED DATA</div>
  <button
    on:click={() =>
      generateData(28, 15, "01/01/2024 11:10", [24, 25], [200, 400])}
    >Generate</button
  >
</div>
