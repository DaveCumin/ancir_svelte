<script>
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

  $: {
    update();
  }

  function keeptolimits() {
    //Make sure min and max reflect the limits
    if (min < limits[0]) {
      min = limits[0];
    }
    if (max > limits[1]) {
      max = limits[1];
    }

    // Keep value within the hard limits
    if (value < limits[0]) {
      value = limits[0];
      min = value;
    }
    if (value > limits[1]) {
      value = limits[1];
      max = value;
    }
  }
  function update() {
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

    keeptolimits();
  }

  //for formatting the min and max
  function truncateDecimalPlaces(number, maxDecimalPlaces = 2) {
    // Convert the number to a string and match the decimal part
    const match = ("" + number).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

    // If there is no match, or the decimal part is not present, return the original number
    if (!match || !match[1]) {
      return number;
    }

    // Truncate the decimal part to the specified maximum decimal places
    const truncatedDecimal = match[1].slice(0, maxDecimalPlaces);

    // Return the truncated value as a number
    return parseFloat(match[0].replace(match[1], truncatedDecimal));
  }
</script>

<div class="processItem">
  <label for="val" class="sliderLabel">
    <span>{label}</span>
    <input
      class="numberInput"
      type="number"
      id="val"
      {min}
      {max}
      {step}
      on:change={() => update()}
      on:input={() => {
        keeptolimits();
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
    on:change={() => update()}
    on:input={() => {
      keeptolimits();
    }}
    bind:value
  />
  <span class="min {min === limits[0] ? 'stop' : ''}"
    >{truncateDecimalPlaces(min)}</span
  >
  <span class="max">{truncateDecimalPlaces(max)}</span>
</div>

<style>
  .numberInput {
    width: 40%;
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

  .min {
    font-size: 0.7em;
    display: block;
    margin-top: -0.7em;
    margin-left: 0.2em;
  }
  .max {
    font-size: 0.7em;
    display: block;
    margin-top: -1.3em;
    margin-left: 0.2em;
    float: right;
  }
  .stop {
    font-style: italic;
    text-decoration: underline;
  }
</style>
