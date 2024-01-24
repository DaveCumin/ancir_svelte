<script context="module">
  // Define the functions
  export function replace(
    startVals = [1, 2, 3],
    params = { from: 0, to: 100 }
  ) {
    //ADDS A SET VALUE TO DATA
    var arr = [...startVals];

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == params.from) {
        arr[i] = params.to;
      }
    }

    return arr;
  }
</script>

<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  $: {
    dispatch("update", {
      params,
    });
  }

  export let paramsStart;
  export let typeTime;

  export let params = { from: 0, to: 100 };
  if (Object.keys(paramsStart).length > 0) {
    params = Object.assign({}, paramsStart);
  }
</script>

<label>From:</label><input bind:value={params.from} />
<label>To:</label><input bind:value={params.to} />
