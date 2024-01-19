<script>
  import { menuModalActive, menuModalType } from "../store";
</script>

{#if $menuModalActive && $menuModalType === "about"}
  <div class="backdrop"></div>
  <dialog id="modal_data" class="dialog">
    <div class="modal-box">
      <h1>ABOUT</h1>
      <div>
        <p>
          This is our 'AnCir' to the need for a simple-to-use (GUI; no coding)
          tool for analysis of circadian rhythms. Currently, the tool only
          allows for import of csv data and plotting of actigrams.
        </p>
        <button on:click={() => ($menuModalActive = false)}>Close</button>
      </div>
    </div>
  </dialog>
{/if}

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
    overflow: auto;
    background: var(--bg-color);
    z-index: 9998;
    box-shadow: 5px 5px 15px var(--secondary-color);
    border: none;
    border-radius: 5px;
  }
</style>
