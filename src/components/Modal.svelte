<!-- Modal.svelte -->
<script>
  import { modalActive, modalContent } from "../store.js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  function closeModal() {
    modalActive.set(false);
  }

  function completeModalAction(result) {
    closeModal();
    dispatch("modalCompleted", result);
  }

  function cancelModal() {
    closeModal();
    dispatch("modalCancelled");
  }
</script>

{#if $modalActive}
  <div class="modal">
    <div class="modal-content">
      {@html $modalContent}
      <div class="modal-buttons">
        <button on:click={cancelModal}>Cancel</button>
        <button on:click={completeModalAction}>OK</button>
      </div>
    </div>
  </div>
{/if}

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
