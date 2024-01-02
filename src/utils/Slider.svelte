<script>
  import { createEventDispatcher } from "svelte";
  //for the slider
  export let min = -100;
  export let max = 100;
  export let step = 1;
  //hard stops can be given here
  export let limits = [-Infinity, Infinity];
  //THE VALUE
  export let value;
  //the label
  export let label = "Label:";

  function update() {
    // Keep within the hard limits
    if (value < limits[0]) {
      value = limits[0];
    }
    if (value > limits[1]) {
      value = limits[1];
    }

    //calculate new slider values, if needed
    const range = Math.abs(max - min);
    const bottom20 = Math.max(limits[0], min + range * 0.2);
    const top20 = Math.min(limits[1], max - range * 0.2);
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
      on:change={update}
      on:input={() => {
        update();
        dispatch("change", { value });
      }}
      bind:value
    />
  </label>
  <input
    class="sliderInput"
    type="range"
    {min}
    {max}
    {step}
    on:change={update}
    on:input={() => {
      update();
      dispatch("change", { value });
    }}
    bind:value
  />
</div>

<style>
  .numberInput {
    width: 40%; /* Adjust the width as needed */
    max-width: 6em;
    float: right;
    height: 1.1rem;
    border-radius: 0.5rem;
    margin-left: auto;
    align-self: center;
    padding-left: 4px;
    border-width: 1px;
    text-align: end;
    background: var(--bg-color);
  }

  .sliderInput {
    width: 100%;
    accent-color: var(--primary-color);
    cursor: pointer;
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
  }

  .sliderLabel {
    line-height: 1rem;
    display: flex;
  }
  .sliderLabel > span {
    align-self: center;
  }
  .processItem {
    padding: 5px 0px;
  }
</style>
