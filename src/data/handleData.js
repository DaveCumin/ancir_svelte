import { data, graphs, activeGraphTab } from "../store";
import { get } from "svelte/store";

//Get data from the data structure
export function getDataFromTable(tableID, key, getProcessed = true) {
  const tempData =
    get(data)[get(data).findIndex((d) => d.id === tableID)].data[key];
  //console.log(tempData);
  if (tempData.processedData.length > 0 && getProcessed) {
    return tempData.processedData;
  }

  if (tempData.type === "time") {
    return tempData.timeData;
  }
  return tempData.data;
}

//Gets the name of the field (for display purposes)
export function getFieldName(tableID, field) {
  const tempData =
    get(data)[get(data).findIndex((d) => d.id === tableID)].data[field];
  return tempData.name;
}

//get the data from graph source
export function getDataFromSource(sourceIndex, vals) {
  const sourceData = get(graphs)[get(activeGraphTab)].sourceData[sourceIndex];
  if (vals.processedData.length > 0) {
    return vals.processedData;
  } else {
    const tableID = sourceData.tableID;

    return getDataFromTable(tableID, vals.field);
  }
}

//get the type of a data field
export function getFieldType(tableID, field) {
  const tempData =
    get(data)[get(data).findIndex((d) => d.id === tableID)].data[field];
  return tempData.type;
}

//Bin the data into binSize bins
// xs and ys are the time and values for an actigram
// binSize is the size of each bin, usually in Hrs
export function averageBinnedValues(xs, ys, binSize) {
  const Nbins = Math.ceil(
    (Math.max(...xs.filter((x) => (x ? x : 0))) + binSize) / binSize
  );

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
    return counts[index] > 0 ? sum / counts[index] : 0;
  });

  return { time: xout, values: averageY };
}

export function getDiffs(data) {
  let diffs = [];
  for (let i = 1; i < data.length; i++) {
    diffs[i - 1] = data[i] - data[i - 1];
  }
  return diffs;
}
// calculate the mean and sd of data
export function getMeanSD(data) {
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;

  const sd = Math.sqrt(
    data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      data.length
  );

  return { mean, sd };
}

//-------
// the following code is to estimate the period from the onset/offset times
// it uses Median Absolute Deviation (MAD) to 'ignore' the possible 'disconnects'
//-----
export function bestFitOnsets(data) {
  // Calculate the median and MAD
  const median = calculateMedian(data);
  const mad = calculateMAD(data, median);

  // Filter out values that are considered outliers
  const filteredData = data.filter(
    (value) => Math.abs(value - median) <= 2 * mad
  );

  // Calculate the mean of the filtered data
  const mean = calculateMean(filteredData);

  return mean;
}

export function calculateMedian(data) {
  const sortedData = data.slice().sort((a, b) => a - b);
  const middle = Math.floor(sortedData.length / 2);

  if (sortedData.length % 2 === 0) {
    return (sortedData[middle - 1] + sortedData[middle]) / 2;
  } else {
    return sortedData[middle];
  }
}

function calculateMAD(data, median) {
  const absoluteDeviations = data.map((value) => Math.abs(value - median));
  return calculateMedian(absoluteDeviations);
}

function calculateMean(data) {
  const sum = data.reduce((acc, value) => acc + value, 0);
  return sum / data.length;
}

//--------
// This is linear regression
export function linearRegression(x, y) {
  const n = x.length;

  if (n !== y.length || n === 0) {
    throw new Error("Input arrays must have the same non-zero length");
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXSquare = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXSquare += x[i] * x[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXSquare - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}
