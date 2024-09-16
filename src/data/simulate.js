import { forceFormat, getPeriod } from "../utils/time/TimeUtils";

export function generateData(
  Ndays,
  fs_min,
  startDate,
  periods,
  maxheights,
  ID
) {
  const newDataEntry = {
    id: ID,
    importedFrom: `simulated(${Ndays},${maxheights[0]})`,
    displayName: `Simulated_${ID}`,
    datalength: Ndays * 24 * (60 / fs_min),
    data: {},
  };

  // Generate the time data
  const timeData = [];
  for (let i = 0; i < newDataEntry.datalength; i++) {
    const time = new Date(
      startDate.getTime() + i * fs_min * 60 * 1000
    ).toLocaleString("en-US");
    timeData.push(time);
  }

  const timefmt = "M/D/YYYY, h:mm:s A";
  const processedTimeData = forceFormat(timeData, timefmt);
  const timePeriod = getPeriod(timeData, timefmt);

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

      const randomValue = Math.random() * mult;
      valueData.push(Math.round(randomValue));
    }

    newDataEntry.data[valueKey] = {
      name: `value${i}`,
      type: "value",
      data: valueData,
    };
  }

  return newDataEntry;
}
