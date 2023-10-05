<script>
  import { createEventDispatcher } from "svelte";

  let selectedProcess = {};
  const dispatch = createEventDispatcher();

  function confirm() {
    // Emit an event to notify the parent component (where you opened the modal)
    // about the confirmation and pass the result
    dispatch("confirmAdd", {
      selectedProcess,
    });
  }

  export let processes = [];
</script>

<!-- Modal content -->
<div class="modal">
  <div class="modal-content">
    <h1>Select Process</h1>
    <label for="process" class='font-semibold '>Process:</label>
    <select id="process" bind:value={selectedProcess}>
      {#each processes as process}
        <option value={process}>{process}</option>
      {/each}
    </select>
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
