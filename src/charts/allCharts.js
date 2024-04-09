// @ts-nocheck
import { DateTime } from "luxon";
import { get } from "svelte/store";
import {
  activeGraphTab,
  graphs,
  graphTabs,
  data,
  statusData,
} from "../store.js";

//---------------------------------------------------------------------
// ----- ADD NEW GRAPHS BELOW
//---------------------------------------------------------------------
import Actigram from "../charts/Actigram/Actigram.svelte";
import ActigramControls from "../charts/Actigram/Actigram_controls.svelte";

import Periodogram from "../charts/Periodogram/Periodogram.svelte";
import PeriodogramControls from "../charts/Periodogram/Periodogram_controls.svelte";

import Raw from "../charts/Raw/Raw.svelte";
import RawControls from "../charts/Raw/Raw_controls.svelte";

export const graphMap = {
  actigram: {
    graph: Actigram,
    controls: ActigramControls,
    prototypechartvalues: { time: "time", values: "values" },
    prototypeother: {
      col: { hex: "#1B1D50", alpha: 0.5 },
      showOnsets: true,
      centileThresh: 80,
      M: 3,
      N: 3,
      estimate: 0,
    },
    params: {
      startTime: DateTime.now()
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        .toISO()
        .slice(0, 16),
      periodHrs: 24,
      binSizeHrs: 0.25,
      width: 800,
      dayHeight: 10,
      betweenHeight: 2,
      doublePlot: 2,
      scaleAxes: "byPlot",
      showAxes: false,
    },
    chartData: {
      data: [{ time: [], values: [], day: [], scaleLimits: [] }],
      startOffsets: [],
      onsets: [],
    },
  },
  periodogram: {
    graph: Periodogram,
    controls: PeriodogramControls,
    prototypechartvalues: { time: "any", values: "any" },
    prototypeother: {
      col: { hex: "#78322e", alpha: 0.5 },
    },
    params: {
      width: 600,
      height: 200,
      minPeriod: 4,
      maxPeriod: 30,
      stepPeriod: 0.25,
      binSizeHrs: 0.25,
    },
    chartData: {},
  },
  raw: {
    graph: Raw,
    controls: RawControls,
    prototypechartvalues: { x: "any", y: "any" },
    prototypeother: {
      col: { hex: "#78322e", alpha: 0.5 },
      size: 2,
      strokeWidth: 1,
      strokeCol: { hex: "#000000", alpha: 0.9 },
    },
    params: {
      width: 600,
      height: 200,
      yDomainMin: 0,
      yDomainMax: 200,
      xDomainMin: 0,
      xDomainMax: 680,
      yAxisLabel: "y-axis",
      xAxisLabel: "x-axis title here",
    },
    chartData: {},
  },
};
//---------------------------------------------------------------------
// ----- ADD NEW GRAPHS ABOVE
//---------------------------------------------------------------------

export function getRandomHexColour() {
  // Generate a random hex color
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
// MAKE A NEW CHART
function putChartValues(keysIN, fieldsIN) {
  const chartValues = {};
  for (let i = 0; i < keysIN.length; i++) {
    chartValues[keysIN[i]] = {
      field: fieldsIN[i],
      processSteps: [],
      processedData: [],
    };
  }
  return chartValues;
}

export function makeNewChart(type) {
  if (get(data).length === 0) {
    //if there is no data
    statusData.update((current) => {
      current.push({
        display: `There is no data to make a ${type} with.`,
      });
      return current;
    });
  } else {
    let newchart = {
      graph: type,
      id: getID(),
      zoom: 1,
      sourceData: [],
      params: { ...deepCopy(graphMap[type].params) },
      chartData: { ...deepCopy(graphMap[type].chartData) },
    };

    get(graphs).push(newchart);

    get(graphTabs).push({ name: "Chart " + getID() });

    //make the updates
    graphTabs.update((currenttabs) => [...currenttabs]);
    activeGraphTab.update(() => get(graphTabs).length - 1);
  }
}

//get the next highest id of graphs
function getID() {
  if (get(graphs).length === 0) {
    return 0;
  }
  let ids = [];
  get(graphs).forEach((d) => ids.push(d.id));

  return Math.max(...ids) + 1;
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
