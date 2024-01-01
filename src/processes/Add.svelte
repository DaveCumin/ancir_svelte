<script context="module">
  // Define the functions
  export function add(startVals = [1, 2, 3], params = { val: 0 }) {
    //ADDS A SET VALUE TO DATA
    var arr = [...startVals];
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i] + params.val;
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
  export let typeTime;

  export let params = { val: 0 };
  if (Object.keys(paramsStart).length > 0) {
    params = Object.assign({}, paramsStart);
  }
</script>

{#if typeTime.type === "value"}
  <Slider min={-20} max={20} bind:value={params.val} label="Add:" />
{:else}
  <!-- TODO: make this work for dates-->
  <div>{JSON.stringify(typeTime.tocheck)}</div>
{/if}
