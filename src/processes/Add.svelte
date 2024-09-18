<script context="module">
  export { Add, forTypes, startParams };
  const forTypes = ["value", "time"];
  const startParams = { val: 0 };
  // Define the functions
  function Add(startVals = [1, 2, 3], params = { val: 0 }) {
    //ADDS A SET VALUE TO DATA
    var arr = [...startVals];
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Number(arr[i]) + Number(params.val);
    }

    return arr;
  }
</script>

<script>
  import Slider from "../utils/Slider.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  $: {
    dispatch("update", {
      params,
    });
  }

  export let paramsStart;
  export let typeTime;

  export let params = { val: 0 };
  if (Object.keys(paramsStart).length > 0) {
    params = Object.assign({}, paramsStart);
  }
</script>

{#if typeTime.type === "value"}
  <Slider min={-20} max={20} bind:value={params.val} label="Add:" />
{:else if typeTime.type === "time"}
  <Slider
    min={-20}
    max={20}
    step={0.5}
    bind:value={params.val}
    label="Add (hrs):"
  />
{/if}
