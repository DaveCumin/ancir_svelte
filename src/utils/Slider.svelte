<script>
  import { createEventDispatcher } from "svelte";
  export let min;
  export let max;
  export let value;

  function update() {
    if (value > max - Math.ceil(max * 0.2)) {
      max = Math.round(max * 2);
      min = Math.round(value / 2);
    }
    if (value < min + Math.ceil(min * 0.2)) {
      min = Math.round(min / 2);
      max = Math.round(value * 2);
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
    bind:value
    on:change={update}
    on:input={() => dispatch("change", { value })}
  />
</div>
