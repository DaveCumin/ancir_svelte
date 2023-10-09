<script context="module">
  // @ts-nocheck
  import ChooseProcess from "../processes/ChooseProcess.svelte";
  import { tick } from "svelte";

  //---------------------------------------------------------------------
  // ----- ADD NEW PROCESSING FUNCTIONS BELOW
  import Add, { add } from "../processes/Add.svelte";
  import Limit, { limit } from "../processes/Limit.svelte";

  // Import functions and components here as needed and add to the maps below
  export const componentMap = {
    add: { component: Add, startParams: { val: 0 } },
    limit: { component: Limit, startParams: { min: 0, max: 12 } },
    // Add more process functions here as needed
  };

  export const processMap = {
    add,
    limit,
    // Add more process functions here as needed
  };

  // ----- ADD NEW PROCESSING FUNCTIONS ABOVE HERE: import the file and add to the maps.
  //---------------------------------------------------------------------

  let WHEREP = "";
  let ID = 0;
  let FIELDNAME = "";
  let WHICHPROCESS = "";

  let selectedSettings = null;

  function closeModal() {
    processModalActive.set(false);
  }
  function openModal() {
    processModalActive.set(true);
  }

  function handleConfirmAddProcess(event) {
    // Update your data array with the result
    selectedSettings = {
      process: event.detail.selectedProcess,
      parameters: componentMap[event.detail.selectedProcess].startParams,
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
    }

    //FOR GRAPH
    if (WHEREP === "graph") {
      graphs.update((currentData) => {
        // Find the data entry with the specified ID
        const newData = [...currentData];
        const datum = newData.find((entry) => entry.id === ID);

        newData[get(activeGraphTab)].sourceData[FIELDNAME][
          ID
        ].processSteps.push(selectedSettings);

        return newData;
      });
    }

    doProcessSteps(WHEREP, ID, FIELDNAME);

    // Reset
    WHICHPROCESS = "";
    closeModal();
  }

  function handleCancelAddProcess() {
    WHICHPROCESS = "";
    closeModal();
  }

  // Function to add a process step to a field in any object
  export function addProcessStep(where, id, fieldName) {
    WHEREP = where;
    ID = id;
    FIELDNAME = fieldName;
    openModal();
  }

  // Function to remove a process step to a field in any object
  export function removeProcessStep(where, ID, fieldName, index) {
    console.log('xx',where, ID, fieldName, index, get(data) )
    if (where === "data") {
      console.log('where===data', where)
      data.update((currentData) => {
        // Find the data entry with the specified ID
        const newData = [...currentData];
        const datum = newData.find((entry) => entry.id === ID);

        // Check if the data entry and key exist
        if (datum && datum.data[fieldName]) {
          // Remove the process step at the specified index
          datum.data[fieldName].processSteps.splice(index, 1);
        }

        return newData;
      });
      doProcessSteps(where, ID, fieldName);
    }

    // GRAPH
    if (where === "graph") {
       console.log('where==graph', where)
      graphs.update((currentData) => {
        const newData = [...currentData];
        // Remove the process step at the specified index

        newData[get(activeGraphTab)].sourceData[fieldName][
          ID
        ].processSteps.splice(index, 1);

        return newData;
      });

      doProcessSteps(where, ID, fieldName);
       console.log('doprocess')
    }
  }

  // Deal with the process of updating the processedData for a given field
  export function updateProcessData(event, where, ID, fieldName) {
    doProcessSteps(where, ID, fieldName);
  }

  function findGraphKeys(table, field) {
    console.log("table, field: " + table + ", " + field);
    const results = [];

    for (let i = 0; i < get(graphs).length; i++) {
      const graph = get(graphs)[i];
      for (let j = 0; j < graph.sourceData.length; j++) {
        const sourceData = graph.sourceData[j];
        if (sourceData.tableID === table && sourceData.y.field === field) {
          results.push({ graph: i, sd: j, key: "y" });
        }
        if (sourceData.tableID === table && sourceData.x.field === field) {
          results.push({ graph: i, sd: j, key: "x" });
        }
      }
    }

    return results.length > 0 ? results : null; // Return an array of results or null if none found
  }

  function doProcessSteps(where, ID, fieldName, graphD = -1) {
    if (where === "data") {
      // JSON data containing the functions to execute, from store
      let processes = get(data).find((entry) => entry.id === ID).data[fieldName]
        .processSteps;

      // Initial values, from store
      let result = [].concat(
        get(data).find((entry) => entry.id === ID).data[fieldName].data
      );

      // Iterate through the JSON array and execute the processes
      if (processes.length > 0) {
        for (const processObj of processes) {
          const processName = processObj.process;
          const processFunction = processMap[processName];

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
        const datum = newData.find((entry) => entry.id === ID);

        // Check if the data entry and key exist
        if (datum && datum.data[fieldName]) {
          // Add a new process step to the selected key
          datum.data[fieldName].processedData = result;
        }
        return newData;
      });

      //Update the graphs
      const graphsToUpdate = findGraphKeys(ID, fieldName);
      if (graphsToUpdate) {
        for (const gtu of graphsToUpdate) {
          doProcessSteps("graph", gtu.key, gtu.sd, gtu.graph);
        }
      }
    }

    //DO FOR GRAPHS
    if (where === "graph") {
      if (graphD < 0) {
        graphD = get(activeGraphTab);
      }

      // JSON data containing the functions to execute, from store
      //TO FIX - the deletion doesn't necessarily only delete from activeGraphTab
      let processes =
        get(graphs)[graphD].sourceData[fieldName][ID].processSteps;

      // Initial values, from store
      let tableindex = get(data).findIndex(
        (d) => d.id === get(graphs)[graphD].sourceData[fieldName].tableID
      );
      let field = get(graphs)[graphD].sourceData[fieldName][ID].field;

      let result = [].concat(get(data)[tableindex].data[field].data);
      if (get(data)[tableindex].data[field].processedData.length > 0) {
        result = get(data)[tableindex].data[field].processedData;
      }
      // Iterate through the JSON array and execute the processes
      if (processes.length > 0) {
        for (const processObj of processes) {
          const processName = processObj.process;
          const processFunction = processMap[processName];

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
        console.log("fn, id: " + fieldName + ", " + ID);
        newData[get(activeGraphTab)].sourceData[fieldName][ID].processedData =
          result;

        return newData;
      });
    }
  }
</script>

<script>
  import {
    data,
    processModalActive,
    graphs,
    activeGraphTab,
  } from "../store.js";
  import { get } from "svelte/store";
</script>

{#if $processModalActive}
  <ChooseProcess
    processes={Object.keys(processMap)}
    on:confirmAdd={handleConfirmAddProcess}
    on:cancelAdd={handleCancelAddProcess}
  />
{/if}
