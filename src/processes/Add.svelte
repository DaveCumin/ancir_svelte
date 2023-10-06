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

  <div class="form-control flex flex-row  items-center w-full max-w-md">
     <label for='val' class="label font-semibold  min-w-[130px]">
       <span class="label-text">Value:</span>
     </label>
      <input type="number" id="val" bind:value={params.val} class="input input-bordered input-info w-24 h-10 mr-3 max-w-xs bg-indigo-50 shadow-md"  />
     <Slider min={1} max={100} bind:value={params.val} />
   </div>


{/if}


 