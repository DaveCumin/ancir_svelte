<script>
  import { createEventDispatcher } from "svelte";
  export let min;
  export let max;
  export let value;
  export let step = 1;

  function update() {
    if (Number.isInteger(step)) {
      // keep whole numbers
      if (value > max - Math.ceil(max * 0.2)) {
        // @ts-ignore
        max = parseInt(max * 2);
        // @ts-ignore
        min = parseInt(value / 2);
      }
      if (value < min + Math.ceil(min * 0.2)) {
        // @ts-ignore
        min = parseInt(min / 2);
        // @ts-ignore
        max = parseInt(value * 2);
      }
    } else {
      //allow fractional steps
      if (value > max - Math.ceil(max * 0.2)) {
        max = max * 2;
        min = value / 2;
      }
      if (value < min + Math.ceil(min * 0.2)) {
        min = min / 2;
        max = value * 2;
      }
    }
  }

  const dispatch = createEventDispatcher();
</script>

<div class=''>

  <input
    class="slider range range-info w-24 h-3"
    type="range"
    {min}
    {max}
    {step}
  bind:value
    on:change={update}
    on:input={() => dispatch("change", { value })}
  />
</div>
