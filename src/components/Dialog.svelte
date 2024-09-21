<script>
  import { menuModalType } from "../store";
  import { fade } from "svelte/transition";

  export let title = "";

  function closeDialog() {
    $menuModalType = "";
  }
  function handleKeydown(event) {
    const key = event.key;
    const keyCode = event.keyCode;
    if (keyCode === 27) {
      //escape
      closeDialog();
    }
  }
  let fadeTime_ms = 250;
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="backdrop"
  on:click={closeDialog}
  transition:fade={{ duration: fadeTime_ms }}
></div>
<dialog
  id="modal_data"
  class="dialog"
  transition:fade={{ duration: fadeTime_ms }}
>
  <div class="modal-box">
    <button class="closeDialogButton" on:click={closeDialog}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg></button
    >
    <h1>{title}</h1>
    <div style="margin-left:1em;">
      <slot />
    </div>
  </div>
</dialog>

<style>
  .backdrop {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(2px);
    z-index: 9998;
  }
  dialog {
    display: block;
    position: absolute;
    top: 10vh;
    z-index: 1000;
    max-height: 80vh;
    max-width: 80vw;
    min-width: 270px;
    overflow: auto;
    background: var(--bg-color);
    z-index: 9999;
    box-shadow: 5px 5px 15px var(--secondary-color);
    border: none;
    border-radius: 5px;
  }
  .closeDialogButton {
    width: 15px;
    cursor: pointer;
    padding: 0;
    float: right;
    margin-right: 5px;
    margin-top: -10px;
    border: none;
    background-color: var(--bg-color);
  }

  svg:hover {
    stroke: red;
  }
</style>
