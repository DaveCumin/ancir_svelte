<script context="module">
  // Define the functions
  export function add(startVals = [1, 2, 3], params = { val: 0 }) {
    console.log(startVals);
    //ADDS A SET VALUE TO EACH OF THE ARRAY VALUES
    var arr = [...startVals];
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i] + params.val;
    }

    return arr;
  }
</script>

<script>
  export let dataIN;
  export let paramsStart;

  export let params = { val: 0 };
  if (Object.keys(paramsStart).length > 0) {
    params = paramsStart;
  }
</script>

{#if typeof dataIN[0] === "number"}
  <label for="val">Value:</label>
  <input type="number" id="val" bind:value={params.val} />
  <input type="range" id="valr" bind:value={params.val} />
{/if}
