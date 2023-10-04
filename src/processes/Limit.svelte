<svelte:options immutable />

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

  const dispatch = createEventDispatcher();
  function update() {
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
    params = paramsStart;
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
  <input type="number" id="min" bind:value={params.min} on:click={update} />
  <input type="range" id="min" bind:value={params.min} on:click={update} />
</div>

<div>
  <label for="val">Max:</label>
  <input type="number" id="max" bind:value={params.max} on:click={update} />
  <input type="range" id="max" bind:value={params.max} on:click={update} />
</div>
