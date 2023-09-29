<script context="module">
  // @ts-nocheck

  import Modal from "./Modal.svelte";
  import AddProcessModal from "./AddProcessModel.svelte";

  import { limit } from "../processes/limit.js";
  import { add } from "../processes/add.js";

  // Import functions here as needed and add to the map below

  const processMap = {
    add,
    limit,
    // Add more process functions here as needed
  };

  // ----- ADD NEW PROCESSING FUNCTIONS ABOVE HERE: import the js file and add to the map.
  //---------------------------------------------------------------------

  let dataProcessed = [1, 2, 3];
  let selectedSettings = null;

  function closeModal() {
    modalActive.set(false);
  }

  function handleConfirmAddProcess(event) {
    // Update your data array with the result
    selectedSettings = event.detail;
    console.log(selectedSettings);
    // Close the modal
    closeModal();
  }

  function handleCancelAddProcess() {
    // Close the modal without making changes
    closeModal();
  }

  // Function to add a process step to a field in any object
  export async function addProcessStep(where, ID, fieldName) {
    const processStepResult = await getProcess();
    console.log(processStepResult);
    if (processStepResult === "OK") {
      if (where === "data") {
        data.update((currentData) => {
          // Find the data entry with the specified ID
          const newData = [...currentData];
          const datum = newData.find((entry) => entry.id === ID);

          // Check if the data entry and key exist
          if (datum && datum.data[fieldName]) {
            // Add a new process step to the selected key
            datum.data[fieldName].processSteps.push(getProcess());
          }
          return newData;
        });

        //Add for graph here.
        doProcessSteps(where, ID, fieldName);
      }
    }
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

  // Deal with the process of getting the input for a function
  // TODO: MAKE THIS A MODAL WITH SETTINGS FROM THE FUNCTION
  async function getProcess() {
    modalActive.set(true);
    console.log(dataProcessed);

    return "testing";
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
  <AddProcessModal
    on:confirmAdd={handleConfirmAddProcess}
    on:cancelAdd={handleCancelAddProcess}
  />
{/if}
