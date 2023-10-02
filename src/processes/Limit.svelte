<script context="module">
  // Define the function
  export function limit(startVals = [1, 2, 3], params = { min: 0, max: 12 }) {
    const dataMin = Math.min(...startVals);
    const dataMax = Math.max(...startVals);

    var arr = startVals;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] < params.min) {
        arr[i] = params.min;
      } else if (arr[i] > params.max) {
        arr[i] = params.max;
      }
    }
    return arr;
  }
</script>

<script>
  // Define the popup to create/edit the process
  import { createEventDispatcher } from "svelte";
  export let dataIN;
  export let paramsStart;

  const dataMin = Math.min(...dataIN);
  const dataMax = Math.max(...dataIN);

  let params = { min: dataMin, max: dataMax };
  if (Object.keys(paramsStart).length > 0) {
    params = paramsStart;
  }
  const dispatch = createEventDispatcher();

  function confirm() {
    // Emit an event to notify the parent component (where you opened the modal)
    // about the confirmation and pass the result
    dispatch("confirmAdd", {
      process: "limit",
      parameters: params,
    });
  }
</script>

<!-- Modal content -->
<div class="modal">
  <div class="modal-content">
    <h1>Limit the values to [min, max]</h1>
    <div>
      <label for="val">Min:</label>
      <input type="number" id="min" bind:value={params.min} />
      <input type="range" id="min" bind:value={params.min} />
    </div>
    <div>
      <label for="val">Max:</label>
      <input type="number" id="max" bind:value={params.max} />
      <input type="range" id="max" bind:value={params.max} />
    </div>
    <div class="modal-buttons">
      <button on:click={confirm}>Confirm</button>
      <button on:click={() => dispatch("cancelAdd")}>Cancel</button>
    </div>
  </div>
</div>

<style>
  .modal {
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  .modal-content {
    background-color: #fefefe;
    margin: 15% auto; /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 80%; /* Could be more or less, depending on screen size */
  }
</style>
