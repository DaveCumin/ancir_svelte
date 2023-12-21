<script>
  import { createEventDispatcher, onDestroy } from "svelte";
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

  function clickOutside(element) {
    function handleClick(event) {
      const targetEl = event.target;
      if (element && !element.contains(targetEl)) {
        const clickOutsideEvent = new CustomEvent("outside");
        element.dispatchEvent(clickOutsideEvent);
      }
    }
    document.addEventListener("click", handleClick, true);

    onDestroy(() => {
      document.removeEventListener("click", handleClick, true);
    });
  }
</script>

<!-- Modal content -->
<div class={processModalActive ? "overlay" : ""}>
  <dialog
    id="my_modal_1"
    class="menu-bar modal pointer-events-auto pointer-cursor"
  >
    <div
      on:outside={() => {
        $processModalActive = false;
      }}
      use:clickOutside
      class="modal-box"
    >
      <h5 class="font-bold text-center text-2xl mb-6">Select Process</h5>
      <div class="flex items-center">
        <label for="process" class="flex text-lg font-semibold pr-2"
          >Process:</label
        >
        <select
          class="inline-flex select select-neutral select-md w-24 mb-1 bg-base-100 shadow-md"
          id="process"
          bind:value={selectedProcess}
        >
          {#each processes as process}
            <option value={process}>{process}</option>
          {/each}
        </select>
      </div>
      <div class="modal-buttons flex w-48 gap-2 pt-4 pl-20 mb-2">
        <button class="btn btn-info text-gray-900" on:click={confirm}
          >Confirm</button
        >
        <button class="btn btn-outline" on:click={() => dispatch("cancelAdd")}
          >Cancel</button
        >
      </div>
    </div>
  </dialog>
</div>

<style>
  .modal {
    z-index: 1;
    opacity: 1;
  }
  .modal-box {
    z-index: 2;
  }
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }
</style>
