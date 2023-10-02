<script context="module">
  // Define the functions
  export function add(startVals = [1, 2, 3], params = { val: 0 }) {
    //ADDS A SET VALUE TO EACH OF THE ARRAY VALUES
    var arr = [...startVals];
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i] + params.val;
    }

    return arr;
  }
</script>

<script>
  import { createEventDispatcher } from "svelte";
  export let dataIN;

  let params = { val: 0 };
  const dispatch = createEventDispatcher();

  function confirm() {
    // Emit an event to notify the parent component (where you opened the modal)
    // about the confirmation and pass the result
    dispatch("confirmAdd", {
      process: "add",
      parameters: params,
    });
  }
</script>

<!-- Modal content -->
<div class="modal">
  <div class="modal-content">
    {#if typeof dataIN[0] === "number"}
      <h1>Add a value to all numbers</h1>
      <label for="val">Value:</label>
      <input type="number" id="val" bind:value={params.val} />
      <input type="range" id="valr" bind:value={params.val} />
    {/if}
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
