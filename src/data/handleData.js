import { data, graphs, activeGraphTab } from "../store";
import { get } from "svelte/store";

//Get data from the data structure
export function getDataData(tableID, key) {
  const tempData =
    get(data)[get(data).findIndex((d) => d.id === tableID)].data[key];

  if (tempData.processedData.length > 0) {
    return tempData.processedData;
  }
  if (tempData.type === "time") {
    return tempData.timeData;
  }
  return tempData.data;
}

//Bin the data into binSize bins
// xs and ys are the time and values for an actigram
// binSize is the size of each bin, usually in Hrs
export function averageBinnedValues(xs, ys, binSize) {
  const Nbins = Math.ceil((Math.max(...xs) + binSize) / binSize);

  const xout = new Array(Nbins);
  const yout = new Array(Nbins);
  const counts = new Array(Nbins);

  for (let b = 0; b < Nbins; b++) {
    xout[b] = b * binSize + binSize / 2; // put in the mid-values for time
    yout[b] = 0;
    counts[b] = 0;
  }

  //put values in bins
  for (let i = 0; i < xs.length; i++) {
    const binIndex = Math.floor(xs[i] / binSize);
    if (ys[i]) {
      yout[binIndex] += ys[i];
      counts[binIndex]++;
    }
  }

  //get the average of the values
  const averageY = yout.map((sum, index) => {
    return counts[index] > 0 ? sum / counts[index] : NaN;
  });

  return { time: xout, values: averageY };
}
