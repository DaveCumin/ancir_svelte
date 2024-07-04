<script>
  export let min = 300;
  export let max = 700;
  export let minValue = 0;
  export let maxValue = 1000;
  export let step = 1;
  let rangeSelected;

  function updateRangeSelected() {
    if (min > max) {
      const temp = max;
      max = min;
      min = temp;
    }
    rangeSelected.style.left = (min / maxValue) * 100 - 2 + "%";
    rangeSelected.style.right = 100 - (max / maxValue) * 100 + "%";
  }
</script>

<div class="range">
  <div class="range-num">
    <input
      type="number"
      name="min"
      min={minValue}
      max={maxValue}
      {step}
      bind:value={min}
      on:input={updateRangeSelected}
    />
    <label>Periods</label>
    <input
      type="number"
      name="max"
      min={minValue}
      max={maxValue}
      {step}
      bind:value={max}
      on:input={updateRangeSelected}
    />
  </div>
  <div class="range-slider">
    <span class="range-selected" bind:this={rangeSelected}></span>
  </div>
  <div class="range-input">
    <input
      type="range"
      class="min"
      style="left: -0.4em;"
      min={minValue}
      max={maxValue}
      {step}
      bind:value={min}
      on:input={updateRangeSelected}
    />
    <input
      type="range"
      class="max"
      min={minValue}
      max={maxValue}
      {step}
      bind:value={max}
      on:input={updateRangeSelected}
    />
  </div>
</div>

<style>
  .range {
    width: 80%;
    flex-basis: 100%;
    flex-grow: 0;
    flex-shrink: 0;
    margin: 10px;
  }
  .range-slider {
    height: 0.45rem;
    position: relative;
    background-color: var(--font-color);
    border-radius: 0.5rem;
    border: solid 1px grey;
  }
  .range-selected {
    height: 100%;
    position: absolute;
    border-radius: 5px;
    background-color: var(--primary-color);
    left: 0%;
    right: 0%;
  }
  .range-input {
    position: relative;
  }
  .range-input input {
    position: absolute;
    width: 100%;
    height: 0;
    top: -0.45rem;
    background: none;
    pointer-events: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }
  .range-input input::-webkit-slider-thumb {
    height: 1.1rem;
    width: 1.1rem;
    border-radius: 50%;
    background-color: var(--primary-color);
    pointer-events: auto;
    -webkit-appearance: none;
    cursor: pointer;
  }

  .range-input input::-webkit-slider-thumb:hover {
    filter: brightness(1.2);
  }

  .range-input input::-moz-range-thumb {
    height: 1.1rem;
    width: 1.1rem;
    border-radius: 50%;
    background-color: var(--primary-color);
    pointer-events: auto;
    -moz-appearance: none;
  }

  .range-num {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;
  }
  .range-num label {
    margin: 0 15px;
  }
  .range-num input {
    width: 60px;
    padding: 5px;
    height: 0.45rem;
  }
</style>
