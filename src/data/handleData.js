import {
  data,
  graphs,
  activeGraphTab,
  contextMenu,
  addedNewChartData,
} from "../store";
import { get } from "svelte/store";
import { getRandomHexColour } from "../charts/allCharts";
import { max } from "../utils/MathsStats";

//Get data from the data structure
export function getDataFromTable(tableID, key, getProcessed = true) {
  const tempData =
    get(data)[get(data).findIndex((d) => d.id === tableID)].data[key];
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

export function getFieldNames(source) {
  return Object.keys(
    get(data)[get(data).findIndex((d) => d.id === source.tableID)].data
  );
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

//remove data from a graph
export function removeGraphData(srcID) {
  graphs.update((currentData) => {
    const newData = [...currentData];
    const currentGraphID = newData[get(activeGraphTab)].id;

    // Find the current graph by ID
    const currentGraph = newData.find((graph) => graph.id === currentGraphID);

    // Check if the currentGraph exists and has sourceData
    if (currentGraph && currentGraph.sourceData) {
      // Remove the i-th sourceData element from the currentGraph
      currentGraph.sourceData.splice(srcID, 1);
    }

    return newData;
  });
  console.log(get(graphs));
}

export function createnewDataForGraph(protoValues, protoOther) {
  contextMenu.update((menu) => {
    menu.labels = [];
    menu.funcs = [];
    return menu;
  });

  for (let i = 0; i < get(data).length; i++) {
    contextMenu.update((menu) => {
      menu.labels.push(get(data)[i].displayName);
      menu.funcs.push(() =>
        addDataToGraph(get(data)[i].id, protoValues, protoOther)
      );
      return menu;
    });
  }
}

export function addDataToGraph(
  tableID_IN,
  prototypechartvalues,
  prototypeother
) {
  let chartvalues = {};

  // Iterate over the keys of the original object, make the fields
  Object.keys(prototypechartvalues).forEach((key, cdindex) => {
    // Create a new object structure for each key
    chartvalues[key] = {
      field: Object.keys(
        get(data)[get(data).findIndex((d) => d.id === tableID_IN)].data
      )[cdindex], //{insert fieldnames in order},
      processSteps: [],
      processedData: [],
    };
  });

  // every graph has a tableID and a name; then add chartvalues
  graphs.update((current) => {
    current[get(activeGraphTab)].sourceData.push({
      tableID: tableID_IN,
      name: "Data " + (1 + get(graphs)[get(activeGraphTab)].sourceData.length),
      chartvalues: chartvalues,
      ...deepCopy(prototypeother),
    });

    //change the colours if there are any
    const L = get(graphs)[get(activeGraphTab)].sourceData.length - 1;
    Object.keys(current[get(activeGraphTab)].sourceData[L]).forEach((k) => {
      if (
        Object.keys(current[get(activeGraphTab)].sourceData[L][k]).includes(
          "hex"
        )
      ) {
        current[get(activeGraphTab)].sourceData[L][k].hex =
          getRandomHexColour();
        console.log(current[get(activeGraphTab)].sourceData[L][k].hex);
      }
    });

    return current;
  });
  if (get(graphs)[get(activeGraphTab)].graph === "raw") {
    addedNewChartData.set(true);
    console.log("set sem");
  }
  console.log(get(graphs));
}

export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

//Bin the data into binSize bins
// xs and ys are the time and values for an actigram
// binSize is the size of each bin, usually in Hrs
export function averageBinnedValues(xs, ys, binSize) {
  const Nbins =
    Math.ceil((max(xs.filter((x) => (x ? x : 0))) + binSize) / binSize) || 1;

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
