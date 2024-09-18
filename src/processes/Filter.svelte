<script context="module">
  import { min, max } from "../utils/MathsStats";

  export { Filter, forTypes, startParams };
  const forTypes = ["value", "time"];
  const startParams = { min: -Infinity, max: Infinity };

  // Define the function
  function Filter(startVals = [1, 2, 3], params = { min: 0, max: 12 }) {
    const dataMin = min(startVals);
    const dataMax = max(startVals);

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
  export let dataIN;

  const dataMin = min(dataIN);
  const dataMax = max(dataIN);

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

{#if typeTime.type === "value"}
  <Slider
    min={dataMin}
    max={dataMax}
    limits={[dataMin, dataMax]}
    bind:value={params.min}
    label="Min:"
  />
  <Slider
    min={dataMin}
    max={dataMax}
    limits={[dataMin, dataMax]}
    bind:value={params.max}
    label="Max:"
  />
{:else if typeTime.type === "time"}
  <Slider
    min={dataMin}
    max={dataMax}
    limits={[dataMin, dataMax]}
    bind:value={params.min}
    label="Min (hrs):"
  />
  <Slider
    min={dataMin}
    max={dataMax}
    limits={[dataMin, dataMax]}
    bind:value={params.max}
    label="Max (hrs):"
  />
{/if}
