<script context="module">
  // Define the function
  export function limit(startVals = [1, 2, 3], params = { min: 0, max: 12 }) {
    const dataMin = Math.min(...startVals);
    const dataMax = Math.max(...startVals);

    var arr = startVals;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] < params.min) {
        arr[i] = params.min;
      } else if (arr[i] > params.max) {
        arr[i] = params.max;
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

  export let dataIN;
  export let paramsStart;

  const dataMin = Math.min(...dataIN);
  const dataMax = Math.max(...dataIN);

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

<div>
  <label for="val">Min:</label>
  <input type="number" id="min" bind:value={params.min} />
  <Slider min={dataMin} max={dataMax} bind:value={params.min} />
</div>

<div>
  <label for="val">Max:</label>
  <input type="number" id="max" bind:value={params.max} />
  <Slider min={dataMin} max={dataMax} bind:value={params.max} />
</div>
