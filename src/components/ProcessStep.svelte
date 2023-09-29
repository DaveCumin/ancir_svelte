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

  modalActive.set(false);

  // Function to add a process step to a field in any object
  export function addProcessStep(object, fieldName) {
    const processStep = getProcess();
    if (processStep) {
      object[fieldName].processSteps.push(processStep);
      doProcessSteps(object, fieldName);
    }

    return object;
  }

  // Function to remove a process step to a field in any object
  export function removeProcessStep(object, fieldName, index) {
    object[fieldName].processSteps.splice(index, 1);
    doProcessSteps(object, fieldName);
    return object;
  }

  // Deal with the process of getting the input for a function
  // TODO: MAKE THIS A MODAL WITH SETTINGS FROM THE FUNCTION
  function getProcess() {
    console.log("hello from here");
    modalActive.set(true);
    //return prompt(`Add a process step}`);
    let test = Math.round(Math.abs(Math.random()) * 100);
    return {
      process: "testing",
      parameters: { this: "that", rand: test },
    };
  }

  // Deal with the process of updating the processedData for a given field
  function doProcessSteps(object, fieldName) {
    // JSON data containing the functions to execute
    const processes = [
      { process: "add", parameters: { val: 5 } },
      { process: "add", parameters: { val: 12 } },
      { process: "limit", parameters: { min: 2, max: 15 } },
      // Add more function descriptions as needed
    ];

    // Initial value
    let result = 0;

    console.log(processes);

    // Iterate through the JSON array and execute the processes
    for (const processObj of processes) {
      const processName = processObj.process;
      const processFunction = processMap[processName];

      if (typeof processFunction === "function") {
        // Check if the function exists in the processMap
        console.log(processObj);
        result = processFunction(result, processObj.parameters, "do"); //CALL THE FUNCTION WITH PARAMS
        console.log("reslt: " + result);
      } else {
        console.error(`Function '${processName}' does not exist.`);
      }
    }

    console.log(`Final result: ${result}`);
  }
</script>

<script>
  import { modalActive } from "../store.js";
  import { get } from "svelte/store";
</script>

<Modal>hello world</Modal>
