<script>
  import { add } from "../processes/add.js"; // Adjust the path to match your file structure
  import { createEventDispatcher } from "svelte";

  let params = { val: 0 };
  let preview = [1, 2, 3]; // Initial preview with default values
  const dispatch = createEventDispatcher();

  function updatePreview() {
    // Call the add function to update the preview
    preview = add(preview, params, "do");
  }

  function confirm() {
    // Call the add function one more time to update the store
    const result = add(preview, params, "do");

    // Emit an event to notify the parent component (where you opened the modal)
    // about the confirmation and pass the result
    dispatch("confirmAdd", params);
  }
</script>

<!-- Modal content -->
<div class="modal">
  <div class="modal-content">
    <h1>Add Process</h1>
    <label for="val">Value:</label>
    <input
      type="number"
      id="val"
      bind:value={params.val}
      on:input={updatePreview}
    />

    <h2>Preview:</h2>
    <ul>
      {#each preview as value}
        <li>{value}</li>
      {/each}
    </ul>

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
