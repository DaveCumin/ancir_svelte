<script context="module">
  // @ts-nocheck

  import Modal from "./Modal.svelte";

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

  let processData;

  // Function to add a process step to a field in any object
  export async function addProcessStep(where, ID, fieldName) {
    processData = await getProcess();

    console.log("RESULT: ");
    console.log("done3");

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
    let modalPromise; // Declare modalPromise here

    return new Promise((resolve) => {
      modalPromise = resolve;
      // Display the modal with appropriate content
      makeContents(add([1, 2, 3, 4], { val: 5 }, "show"));
      modalActive.set(true);
    }).then((result) => {
      processData = result; // Assign the value of processData when the modal resolves
      return result;
    });
  }

  function makeContents(processParts) {
    if (!processParts || processParts.length < 1) return ""; // Handle the case when processParts is not defined

    let contents = "";

    processParts.forEach((part) => {
      if (part.type === "slider") {
        contents += `
        <label for="${part.label}">${part.label}:</label>
        <span id="${part.label}Value">${part.value}</span>
        <input type="range" id="${part.label}" min="${
          part.range[0] || 0
        }" max="${part.range[1] || 100}" value="${part.value}" on:input={e => ${
          part.label
        }Value.textContent = e.target.value}>
        <br>
      `;
      } else if (part.type === "checkbox") {
        contents += `
        <label for="${part.label}">${part.label}:</label>
        <input type="checkbox" id="${part.label}" bind:checked={${part.label}Value}>
        <br>
      `;
      }
    });

    modalContent.set(contents);
    console.log(get(modalContent));
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

<Modal />
