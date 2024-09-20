<script>
  // @ts-nocheck
  import { formatDate } from "./TimeUtils";
  import { DateTime } from "luxon";

  //params
  export let thedatetime;
  export let label = "Date and Time:";

  let picker;

  function showpicker() {
    picker.showPicker();
  }
  function handleInput(event) {
    // Update thedatetime
    thedatetime = DateTime.fromISO(event.target.value);
  }
</script>

<div class="datetimeselect">
  <label>{label}</label>
  <span on:click={showpicker}>{formatDate(thedatetime)}</span>
  <input
    bind:this={picker}
    class="selection"
    type="datetime-local"
    bind:value={thedatetime}
    on:input={handleInput}
  />
  <span class="icon" on:click={showpicker}>🗓️</span>
</div>

<style>
  .datetimeselect {
    cursor: pointer;
    display: inline-flex;
  }
  .selection {
    width: 0;
    height: 0;
    margin: 0px;
    padding: 0px;
    position: relative;
    left: 10px;
    z-index: 0;
  }
  .icon {
    position: relative;
    cursor: pointer;
  }
</style>
