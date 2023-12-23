<script context="module">
  // Define the functions
  export function add(startVals = [1, 2, 3], params = { val: 0 }) {
    //ADDS A SET VALUE TO EACH OF THE ARRAY VALUES
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

  export let params = { val: 0 };
  if (Object.keys(paramsStart).length > 0) {
    params = Object.assign({}, paramsStart);
  }
</script>

{#if typeof dataIN[0] === "number"}
  <Slider min={-20} max={20} bind:value={params.val} label="Add:" />
{/if}
