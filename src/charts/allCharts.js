// @ts-nocheck
import { get } from "svelte/store";
import {
  activeGraphTab,
  graphs,
  graphTabs,
  data,
  statusData,
} from "../store.js";

export function getRandomHexColour() {
  // Generate a random number between 0 and 16777215 (0xFFFFFF in hex)
  const randomColor = Math.floor(Math.random() * 16777215);
  // Convert the random number to a hex string and pad with leading zeros if necessary
  const hexColor = "#" + randomColor.toString(16).padStart(6, "0");
  return hexColor;
}

//--Auto add the graphs
const modules = import.meta.glob("../charts/**/*.svelte");

// Initialize an empty componentMap
export let graphMap = {};

// Function to dynamically lo ad
async function loadGraphFiles() {
  for (const path in modules) {
    const module = await modules[path]();

    const fileName = path.split("/").pop().split(".").shift();
    const folderName = path.split("/").slice(-2)[0];

    if (folderName == fileName) {
      console.log(fileName);
      console.log(module);
      console.log(module.defaultParams);

      const controlsPath =
        path.substring(0, path.lastIndexOf(".")) + "_controls.svelte";
      const controlsModule = await modules[controlsPath]();
      const defaultsPath =
        path.substring(0, path.lastIndexOf(".")) + "_defaults.svelte";
      const defaults = await modules[defaultsPath]();

      graphMap[fileName] = {
        graph: module.default,
        controls: controlsModule.default || {}, //TODO_high: this isn't working
        params: defaults.defaultParams || {},
        prototypechartvalues: defaults.defaultchartvalues || {},
        prototypeother: defaults.defaultother || {},
        chartData: defaults.defaultChartData || {},
        extras: [],
      };
    }
  }
}

// Load the graph files when the module script is executed
export const graphFilesLoaded = loadGraphFiles().then(() => {
  console.log("Graph files loaded:", graphMap);
  console.log(graphMap);
});
//----------------------

// MAKE A NEW CHART
function putChartValues(keysIN, fieldsIN) {
  const chartValues = {};
  for (let i = 0; i < keysIN.length; i++) {
    chartValues[keysIN[i]] = {
      field: fieldsIN[i],
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
      extras: { ...deepCopy(graphMap[type].extras) },
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
