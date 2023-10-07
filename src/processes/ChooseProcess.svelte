<script>
  import { createEventDispatcher } from "svelte";
  import { processModalActive } from "../store";

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
<dialog
  id="my_modal_1"
  class="menu-bar modal pointer-events-auto pointer-cursor"
>
  <div class="modal-box bg-blue-50">
    <h5 class="font-bold text-center text-2xl mb-6">Select Process</h5>
    <div class="flex items-center">
      <label for="process" class="flex text-lg font-semibold pr-2"
        >Process:</label
      >
      <select
        class="inline-flex select select-info select-md w-24 mb-1 bg-blue-50 shadow-md"
        id="process"
        bind:value={selectedProcess}
      >
        {#each processes as process}
          <option value={process}>{process}</option>
        {/each}
      </select>
    </div>
    <div class="modal-buttons flex w-48 gap-2 pt-4 pl-20 mb-2">
      <button class="btn btn-accent text-gray-900" on:click={confirm}
        >Confirm</button
      >
      <button class="btn btn-outline" on:click={() => dispatch("cancelAdd")}
        >Cancel</button
      >
      <button
        class="btn btn-outline"
        on:click={() => ($processModalActive = false)}>Close</button
      >
    </div>
  </div>
</dialog>

<style>
  .modal {
    z-index: 1;
    opacity: 1;
  }
  .modal-box {
    z-index: 2;
  }
</style>
