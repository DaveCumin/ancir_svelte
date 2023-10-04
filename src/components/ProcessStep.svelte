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
  let PROCESSINDEX = 0;
  let EDITING = false;

  let selectedSettings = null;

  function closeModal() {
    EDITING = false;
    modalActive.set(false);
  }
  function openModal() {
    modalActive.set(true);
  }

  function handleConfirmAddProcess(event) {
    console.log(event);

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
          if (EDITING) {
            // Add a new process step to the selected key
            datum.data[FIELDNAME].processSteps.splice(
              PROCESSINDEX,
              1,
              selectedSettings
            );
          } else {
            datum.data[FIELDNAME].processSteps.push(selectedSettings);
          }
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

        // Check if the data entry and key exist
        if (EDITING) {
          newData[get(activeGraphTab)]["sourceData"][ID][
            FIELDNAME
          ].processSteps.splice(PROCESSINDEX, 1, selectedSettings);
        } else {
          newData[get(activeGraphTab)]["sourceData"][ID][
            FIELDNAME
          ].processSteps.push(selectedSettings);
        }

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
    if (where === "data") {
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
      graphs.update((currentData) => {
        const newData = [...currentData];
        // Remove the process step at the specified index

        newData[get(activeGraphTab)].sourceData[ID][
          fieldName
        ].processSteps.splice(index, 1);

        return newData;
      });

      doProcessSteps(where, ID, fieldName);
    }
  }

  export async function editProcessStep(where, id, fieldName, index) {
    WHEREP = where;
    ID = id;
    FIELDNAME = fieldName;
    PROCESSINDEX = index;
    EDITING = true;

    if (WHEREP === "data") {
      WHICHPROCESS =
        get(data)[ID]["data"][FIELDNAME]["processSteps"][PROCESSINDEX][
          "process"
        ];
    }

    if (WHEREP === "graph") {
      WHICHPROCESS =
        get(graphs)[get(activeGraphTab)]["sourceData"][ID][fieldName]
          .processSteps[index].process;
    }

    openModal();
  }

  // Deal with the process of updating the processedData for a given field
  export function updateProcessData(event, where, ID, fieldName) {
    doProcessSteps(where, ID, fieldName);
  }

  function doProcessSteps(where, ID, fieldName) {
    if (where === "data") {
      // JSON data containing the functions to execute, from store
      let processes = get(data)[ID]["data"][fieldName]["processSteps"];

      // Initial values, from store
      let result = get(data)[ID]["data"][fieldName]["data"];

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
    }

    //DO FOR GRAPHS
    if (where === "graph") {
      // JSON data containing the functions to execute, from store
      let processes =
        get(graphs)[get(activeGraphTab)].sourceData[ID][fieldName].processSteps;

      // Initial values, from store
      let tableID = get(graphs)[get(activeGraphTab)].sourceData[ID].tableID;
      let field =
        get(graphs)[get(activeGraphTab)].sourceData[ID][fieldName].field;

      let result = get(data)[tableID].data[field].data;
      if (get(data)[tableID].data[field].processedData.length > 0) {
        result = get(data)[tableID].data[field].processedData;
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

        newData[get(activeGraphTab)].sourceData[ID][fieldName].processedData =
          result;

        return newData;
      });
    }
  }
</script>

<script>
  import { data, modalActive, graphs, activeGraphTab } from "../store.js";
  import { get } from "svelte/store";
</script>

{#if $modalActive}
  <ChooseProcess
    processes={Object.keys(processMap)}
    on:confirmAdd={handleConfirmAddProcess}
    on:cancelAdd={handleCancelAddProcess}
  />
{/if}
