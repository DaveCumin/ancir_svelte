<script context="module">
  // @ts-nocheck
  import { data, graphs, activeGraphTab } from "../store.js";
  import { get } from "svelte/store";
  import { getDataFromTable } from "../data/handleData.js";

  //---------------------------------------------------------------------
  // ----- ADD NEW PROCESSING FUNCTIONS BELOW
  import Add, { add } from "../processes/Add.svelte";
  import Filter, { filter } from "../processes/Filter.svelte";
  import Replace, { replace } from "../processes/Replace.svelte";

  // Import functions and components here as needed and add to the maps below
  export const componentMap = {
    add: {
      component: Add,
      startParams: { val: 0 },
      func: add,
      forTypes: ["value", "time"],
    },
    filter: {
      component: Filter,
      startParams: { min: 0, max: 12 },
      func: filter,
      forTypes: ["value", "time"],
    },
    replace: {
      component: Replace,
      startParams: { from: -999, to: NaN },
      func: replace,
      forTypes: ["value"],
    },
    // Add more process functions here as needed
  };

  // ----- ADD NEW PROCESSING FUNCTIONS ABOVE HERE: import the file and add to the maps.
  //---------------------------------------------------------------------

  let selectedSettings = null;

  //add a process when context menu is clicked clicked
  export function addProcess(PROCESS, WHEREP, ID, FIELDNAME) {
    // Update your data array with the result
    selectedSettings = {
      process: PROCESS,
      parameters: componentMap[PROCESS].startParams,
    };

    if (WHEREP === "data") {
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

    //FOR GRAPH
    if (WHEREP === "graph") {
      graphs.update((currentData) => {
        // Find the data entry with the specified ID
        const newData = [...currentData];
        const datum = newData.find((entry) => entry.id === ID);

        newData[get(activeGraphTab)].sourceData[ID].chartvalues[
          FIELDNAME
        ].processSteps.push(selectedSettings);

        return newData;
      });
      //now update the data with the new process
      updateGraphProcess(get(activeGraphTab), ID, FIELDNAME);
    }
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

  //Update the data with processes for graphs
  export function updateGraphProcess(graph, sourcei, xy) {
    // Initial values, from store
    let tableID = get(graphs)[graph].sourceData[sourcei].tableID;
    let field = get(graphs)[graph].sourceData[sourcei].chartvalues[xy].field;

    let result = getDataFromTable(tableID, field);

    //check for data processes and add them
    //If there are graph processes, execute the processes
    let processes =
      get(graphs)[graph].sourceData[sourcei].chartvalues[xy].processSteps;
    if (processes.length > 0) {
      result = processData(processes, result);
    }

    //UPDATE THE STORE
    graphs.update((currentData) => {
      // Find the data entry with the specified ID
      const newData = [...currentData];
      newData[graph].sourceData[sourcei].chartvalues[xy].processedData = result;
      return newData;
    });
  }

  // FUNCTION THAT UPDATES THE PROCESSED DATA, AND ANY GRAPHED DATA IF THERE ARE
  export function updateDataProcess(tableID, field) {
    // Initial values, from store
    let result = getDataFromTable(tableID, field, false);

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
        // Add a new process step to the selected key
        datum.data[field].processedData = result;
      }
      return newData;
    });

    //Update any graphs that use the data
    get(graphs).forEach((graph, graphIndex) => {
      graph.sourceData.forEach((source, sourceIndex) => {
        if (source.tableID === tableID) {
          Object.keys(source.chartvalues).forEach((key) => {
            if (source.chartvalues[key].field === field) {
              updateGraphProcess(graphIndex, sourceIndex, key);
            }
          });
        }
      });
    });
  }
</script>
