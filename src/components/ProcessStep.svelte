<script context="module">
  // @ts-nocheck
  import ChooseProcess from "../processes/ChooseProcess.svelte";
  import { tick } from "svelte";

  //---------------------------------------------------------------------
  // ----- ADD NEW PROCESSING FUNCTIONS BELOW
  import Add, { add } from "../processes/Add.svelte";
  import Limit, { limit } from "../processes/Limit.svelte";

  // Import functions here as needed and add to the map below
  const processMap = {
    add,
    limit,
    // Add more process functions here as needed
  };

  // ----- ADD NEW PROCESSING FUNCTIONS ABOVE HERE: import the js file and add to the map.
  //---------------------------------------------------------------------

  let WHEREP = "";
  let ID = 0;
  let FIELDNAME = "";
  let WHICHPROCESS = "";
  let selectedSettings = null;

  function closeModal() {
    modalActive.set(false);
  }
  function openModal() {
    modalActive.set(true);
  }

  function handleConfirmAddProcess(event) {
    // Update your data array with the result
    console.log(event);
    selectedSettings = event.detail;

    if (WHEREP === "data") {
      data.update((currentData) => {
        // Find the data entry with the specified ID
        const newData = [...currentData];
        const datum = newData.find((entry) => entry.id === ID);

        // Check if the data entry and key exist
        if (datum && datum.data[FIELDNAME]) {
          // Add a new process step to the selected key
          datum.data[FIELDNAME].processSteps.push(selectedSettings);
        }
        return newData;
      });

      //Add for graph here.
      doProcessSteps(WHEREP, ID, FIELDNAME);
    }

    // Close the modal
    closeModal();
  }

  function handleCancelAddProcess() {
    WHICHPROCESS = "";
    closeModal();
  }

  async function choseProcess(event) {
    WHICHPROCESS = event.detail.selectedProcess;
    closeModal();
    await tick();
    openModal();
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
  }

  // Deal with the process of updating the processedData for a given field
  function doProcessSteps(where, ID, fieldName) {
    if (where === "data") {
      // JSON data containing the functions to execute, from store
      let processes = get(data)[ID]["data"][fieldName]["processSteps"];

      // Initial values, from store
      let result = get(data)[ID]["data"][fieldName]["data"];

      // Iterate through the JSON array and execute the processes
      for (const processObj of processes) {
        const processName = processObj.process;
        const processFunction = processMap[processName];

        if (typeof processFunction === "function") {
          // Check if the function exists in the processMap
          result = processFunction(result, processObj.parameters, "do"); //CALL THE FUNCTION WITH PARAMS
          console.log(result);
        } else {
          // TODO: MAKE THIS AN ERROR AND HANDLE IT BETTER
          console.error(`Function '${processName}' does not exist.`);
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
  }
</script>

<script>
  import { data, modalActive, modalContent } from "../store.js";
  import { get } from "svelte/store";
</script>

{#if $modalActive}
  {#if WHICHPROCESS === ""}
    <ChooseProcess
      processes={Object.keys(processMap)}
      on:confirmAdd={choseProcess}
      on:cancelAdd={handleCancelAddProcess}
    />
  {:else if WHICHPROCESS === "add"}
    <Add
      on:confirmAdd={() => {
        handleConfirmAddProcess();
      }}
      on:cancelAdd={handleCancelAddProcess}
    />
  {:else if WHICHPROCESS === "limit"}
    <Limit
      on:confirmAdd={() => {
        handleConfirmAddProcess();
      }}
      on:cancelAdd={handleCancelAddProcess}
    />
  {/if}
{/if}
