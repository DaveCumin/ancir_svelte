<script context="module">
  // Define the function
  export function filter(startVals = [1, 2, 3], params = { min: 0, max: 12 }) {
    const dataMin = Math.min(...startVals);
    const dataMax = Math.max(...startVals);

    var arr = [...startVals];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] < params.min) {
        arr[i] = NaN;
      } else if (arr[i] > params.max) {
        arr[i] = NaN;
      }
    }
    return arr;
  }
</script>

<script>
  import { createEventDispatcher } from "svelte";
  import Slider from "../utils/Slider.svelte";

  const dispatch = createEventDispatcher();

  $: {
    dispatch("update", {
      params,
    });
  }

  export let paramsStart;
  export let typeTime;

  const dataMin = 0;
  const dataMax = 10000;

  export let params = { min: dataMin, max: dataMax };
  if (Object.keys(paramsStart).length > 0) {
    params = Object.assign({}, paramsStart);
  }

  //ensure max is always greater than min
  $: {
    if (params.max < params.min) {
      params.max = params.min;
    }
  }
</script>

<Slider
  min={dataMin - 1}
  max={dataMax + 1}
  bind:value={params.min}
  label="Min:"
/>
<Slider
  min={dataMin - 1}
  max={dataMax + 1}
  bind:value={params.max}
  label="Max:"
/>
