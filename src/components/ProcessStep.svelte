<script context="module">
  // @ts-nocheck
  import ChooseProcess from "../processes/ChooseProcess.svelte";

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
    if (Object.keys(event.detail.selectedProcess).length > 0) {
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
        updateDataProcess(ID, FIELDNAME);
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
        updateGraphProcess(get(activeGraphTab), FIELDNAME, ID);
      }
    }
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

  export function updateGraphProcess(graph, sourcei, xy) {
    let processes = get(graphs)[graph].sourceData[sourcei][xy].processSteps;

    // Initial values, from store
    let tableindex = get(data).findIndex(
      (d) => d.id === get(graphs)[graph].sourceData[sourcei].tableID
    );
    let field = get(graphs)[graph].sourceData[sourcei][xy].field;

    let result;
    if (get(data)[tableindex].data[field].processedData.length > 0) {
      result = get(data)[tableindex].data[field].processedData;
    } else {
      result = [].concat(get(data)[tableindex].data[field].data);
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
      newData[graph].sourceData[sourcei][xy].processedData = result;
      return newData;
    });
  }

  // FUNCTION THAT UPDATES THE PROCESSED DATA, AND ANY GRAPHED DATA IF THERE ARE
  export function updateDataProcess(dataID, datakey) {
    // JSON data containing the functions to execute, from store
    let processes = get(data).find((entry) => entry.id === dataID).data[datakey]
      .processSteps;

    // Initial values, from store
    let result = [].concat(
      get(data).find((entry) => entry.id === dataID).data[datakey].data
    );
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
          Object.keys(source).forEach((key) => {
            if (source[key].field === datakey) {
              updateGraphProcess(graphIndex, sourceIndex, key);
            }
          });
        }
      });
    });
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
    processes={Object.keys(componentMap)}
    on:confirmAdd={handleConfirmAddProcess}
    on:cancelAdd={handleCancelAddProcess}
  />
{/if}
