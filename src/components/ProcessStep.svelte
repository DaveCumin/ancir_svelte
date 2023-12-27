<script context="module">
  // @ts-nocheck
  import { data, graphs, activeGraphTab } from "../store.js";
  import { get } from "svelte/store";
  import { makeTimeProcessedData } from "../utils/time/TimeUtils.js";

  //---------------------------------------------------------------------
  // ----- ADD NEW PROCESSING FUNCTIONS BELOW
  import Add, { add } from "../processes/Add.svelte";
  import Limit, { limit } from "../processes/Limit.svelte";

  // Import functions and components here as needed and add to the maps below
  export const componentMap = {
    add: { component: Add, startParams: { val: 0 }, func: add },
    limit: { component: Limit, startParams: { min: 0, max: 12 }, func: limit },
    // Add more process functions here as needed
  };

  // ----- ADD NEW PROCESSING FUNCTIONS ABOVE HERE: import the file and add to the maps.
  //---------------------------------------------------------------------

  let selectedSettings = null;

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
      updateGraphProcess(get(activeGraphTab), ID, FIELDNAME);
    }
  }

  export function updateGraphProcess(graph, sourcei, xy) {
    let processes =
      get(graphs)[graph].sourceData[sourcei].chartvalues[xy].processSteps;

    // Initial values, from store
    let tableindex = get(data).findIndex(
      (d) => d.id === get(graphs)[graph].sourceData[sourcei].tableID
    );
    let field = get(graphs)[graph].sourceData[sourcei].chartvalues[xy].field;

    let result;

    //If there are processes
    if (get(data)[tableindex].data[field].processSteps.length > 0) {
      result = get(data)[tableindex].data[field].processedData;
      //Else, if there are no processes
    } else {
      //deal with time data
      if (get(data)[tableindex].data[field].type === "time") {
        result = get(data)[tableindex].data[field].timeData;
      } else {
        result = [].concat(get(data)[tableindex].data[field].data);
      }
    }

    // Iterate through the JSON array and execute the processes
    if (processes.length > 0) {
      for (const processObj of processes) {
        const processName = processObj.process;
        const processFunction = componentMap[processName].func;

        if (typeof processFunction === "function") {
          // Check if the function exists in the processMap
          result = processFunction(result, processObj.parameters); //CALL THE FUNCTION WITH PARAMS
        } else {
          // TODO: MAKE THIS AN ERROR AND HANDLE IT BETTER
          console.error(`Function '${processName}' does not exist.`);
        }
      }
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
  export function updateDataProcess(dataID, datakey) {
    // JSON data containing the functions to execute, from store
    let processes = get(data).find((entry) => entry.id === dataID).data[datakey]
      .processSteps;

    // Initial values, from store
    let result = [];
    if (
      get(data).find((entry) => entry.id === dataID).data[datakey].type ===
      "time"
    ) {
      result = [].concat(
        get(data).find((entry) => entry.id === dataID).data[datakey].timeData
      );
    } else {
      result = [].concat(
        get(data).find((entry) => entry.id === dataID).data[datakey].data
      );
    }

    // Iterate through the JSON array and execute the processes
    if (processes.length > 0) {
      for (const processObj of processes) {
        const processName = processObj.process;
        const processFunction = componentMap[processName].func;

        if (typeof processFunction === "function") {
          // Check if the function exists in the processMap
          result = processFunction(result, processObj.parameters); //CALL THE FUNCTION WITH PARAMS
        } else {
          // TODO: MAKE THIS AN ERROR AND HANDLE IT BETTER
          console.error(`Function '${processName}' does not exist.`);
        }
      }
    }

    //UPDATE THE STORE
    data.update((currentData) => {
      // Find the data entry with the specified ID
      const newData = [...currentData];
      const datum = newData.find((entry) => entry.id === dataID);

      // Check if the data entry and key exist
      if (datum && datum.data[datakey]) {
        // Add a new process step to the selected key
        datum.data[datakey].processedData = result;
      }
      return newData;
    });
    //Update any graphs that use the data
    get(graphs).forEach((graph, graphIndex) => {
      graph.sourceData.forEach((source, sourceIndex) => {
        if (source.tableID === dataID) {
          Object.keys(source.chartvalues).forEach((key) => {
            if (source.chartvalues[key].field === datakey) {
              updateGraphProcess(graphIndex, sourceIndex, key);
            }
          });
        }
      });
    });
  }
</script>
