<script>
  import { createEventDispatcher } from "svelte";
  export let min = -100;
  export let max = 100;
  export let value;
  export let step = 1;
  export let label = "Label:";
  export let number = false;

  function update() {
    const dblValue = value * 2;
    const range = Math.abs(max - min);
    const bottom20 = min + range * 0.2;
    const top20 = max - range * 0.2;

    if (Number.isInteger(step)) {
      // keep whole numbers
      if (value > top20 || value < bottom20) {
        max = Math.ceil(value + range / 2);
        min = Math.floor(value - range / 2);
      }
    } else {
      // allow fractional steps
      if (value > top20 || value < bottom20) {
        max = value + range / 2;
        min = value - range / 2;
      }
    }
  }

  const dispatch = createEventDispatcher();
</script>

<div class="processItem">
  <label for="val" class="sliderLabel">
    <span>{label}</span>
    <input
      class="numberInput"
      type="number"
      id="val"
      bind:value
      on:change={update}
      on:input={() => dispatch("change", { value })}
    />
  </label>
  <input
    class="sliderInput"
    type="range"
    {min}
    {max}
    {step}
    bind:value
    on:change={update}
    on:input={() => dispatch("change", { value })}
  />
</div>

<style>
  .numberInput {
    width: 40%; /* Adjust the width as needed */
    max-width: 6em;
    float: right;
    height: 1rem;
    font-size: 0.75rem;
    border-radius: 0.5rem;
    margin-left: auto;
    align-self: center;
    padding-left: 4px;
    border-width: 1px;
    text-align: end;
  }

  .sliderInput {
    width: 100%;
    accent-color: lightblue;
    cursor: pointer;
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
  }

  .sliderLabel {
    font-size: 0.75rem;
    line-height: 1rem;
    align-self: center;
    display: flex;
  }
  .processItem {
    padding: 5px 0px;
  }
</style>
