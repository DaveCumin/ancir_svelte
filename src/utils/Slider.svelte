<script>
  import { createEventDispatcher } from "svelte";
  export let min;
  export let max;
  export let value;
  export let step = 1;

  function update() {
    if (Number.isInteger()) {
      if (value > max - Math.ceil(max * 0.2)) {
        max = Math.round(max * 2);
        min = Math.round(value / 2);
      }
      if (value < min + Math.ceil(min * 0.2)) {
        min = Math.round(min / 2);
        max = Math.round(value * 2);
      }
    } else {
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

<input
  class="slider"
  type="range"
  {min}
  {max}
  {step}
  bind:value
  on:change={update}
  on:input={() => dispatch("change", { value })}
/>
