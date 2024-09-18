<script context="module">
  // @ts-nocheck
  import { data, graphs } from "../store.js";
  import { get } from "svelte/store";

  //---------------------------------------------------------------------
  // Dynamically import all process files
  const modules = import.meta.glob("../processes/*.svelte");

  // Initialize an empty componentMap
  export let componentMap = {};

  // Function to dynamically load the process files
  async function loadProcessFiles() {
    for (const path in modules) {
      const module = await modules[path]();
      const fileName = path.split("/").pop().split(".").shift();

      componentMap[fileName] = {
        component: module.default,
        startParams: module.startParams,
        func: module[fileName],
        forTypes: module.forTypes,
      };
    }
  }

  // Load the process files when the module script is executed
  loadProcessFiles().then(() => {
    console.log("Process files loaded:", componentMap);
  });
  //---------------------------------------------------------------------

  let selectedSettings = null;

  //add a process to data when context menu is clicked clicked
  export function addProcessToData(PROCESS, ID, FIELDNAME) {
    // Update your data array with the result
    selectedSettings = {
      process: PROCESS,
      parameters: componentMap[PROCESS].startParams,
    };

    data.update((currentData) => {
      // Find the data entry with the specified ID
      const newData = [...currentData];
      const datum = newData.find((entry) => entry.id === ID);

      // Check if the data entry and key exist
      if (datum && datum.data[FIELDNAME]) {
        datum.data[FIELDNAME].processSteps.push(selectedSettings);
      }
      return newData;
    });
    //now update the data with the new process
    updateDataProcess(ID, FIELDNAME);
  }

  function processData(processes, dataIN) {
    for (const processObj of processes) {
      const processName = processObj.process;
      const processFunction = componentMap[processName].func;

      if (typeof processFunction === "function") {
        // Check if the function exists in the processMap
        dataIN = processFunction(dataIN, processObj.parameters); //CALL THE FUNCTION WITH PARAMS
      } else {
        // TODO _low: MAKE THIS AN ERROR AND HANDLE IT BETTER (unlikely to enter here, realistically)
        console.error(`Function '${processName}' does not exist.`);
      }
    }
    return dataIN;
  }

  // FUNCTION THAT UPDATES THE PROCESSED DATA
  export function updateDataProcess(tableID, field) {
    // Initial values, from store
    let result =
      get(data)[get(data).findIndex((d) => d.id === tableID)].data[field]
        .originalData;

    // Iterate through the JSON array and execute the processes
    let processes = get(data).find((entry) => entry.id === tableID).data[field]
      .processSteps;
    if (processes.length > 0) {
      result = processData(processes, result);
    }

    //UPDATE THE STORE
    data.update((currentData) => {
      // Find the data entry with the specified ID
      const newData = [...currentData];
      const datum = newData.find((entry) => entry.id === tableID);

      // Check if the data entry and key exist
      if (datum && datum.data[field]) {
        // Add a new process step to the selected key¸¸¸¸
        datum.data[field].data = result;
      }
      return newData;
    });
  }

  //UPDATE PROCESS ON GRAPH
  export function updateGraphProcess(graphID, sourceID, keyIN, psID, params) {
    graphs.update((currentGraphs) => {
      const newGraphs = [...currentGraphs];
      const graph = newGraphs.find((entry) => entry.id === graphID);

      // Check if the data entry and key exist
      if (graph && graph.sourceData[sourceID].chartvalues[keyIN]) {
        graph.sourceData[sourceID].chartvalues[keyIN].processSteps[
          psID
        ].parameters = params;
      }
      return newGraphs;
    });
  }

  export function removeGraphProcess(graphID, sourceID, keyIN, psID) {
    graphs.update((currentGraphs) => {
      const newGraphs = [...currentGraphs];
      const graph = newGraphs.find((entry) => entry.id === graphID);

      // Check if the data entry and key exist
      if (graph && graph.sourceData[sourceID].chartvalues[keyIN]) {
        graph.sourceData[sourceID].chartvalues[keyIN].processSteps.splice(
          psID,
          1
        );
      }
      return newGraphs;
    });
  }

  //add a process to data when context menu is clicked clicked
  export function addProcessToGraph(PROCESS, graphID, sourceID, keyIN) {
    // Update your data array with the result
    selectedSettings = {
      process: PROCESS,
      parameters: componentMap[PROCESS].startParams,
    };

    graphs.update((currentGraphs) => {
      // Find the data entry with the specified ID
      const newGraphs = [...currentGraphs];
      const graph = newGraphs.find((entry) => entry.id === graphID);

      // Check if the data entry and key exist
      if (graph && graph.sourceData[sourceID].chartvalues[keyIN]) {
        graph.sourceData[sourceID].chartvalues[keyIN].processSteps.push(
          selectedSettings
        );
      }
      return newGraphs;
    });
  }
</script>
