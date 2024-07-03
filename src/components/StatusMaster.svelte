<script>
  // @ts-nocheck

  import Spinner from "../utils/Spinner.svelte";
  import { statusData, data, graphs } from "../store";
  import { afterUpdate } from "svelte";

  let statusList;

  afterUpdate(() => {
    if (statusData) scrollToBottom(statusList);
  });

  const scrollToBottom = async (node) => {
    node.scroll({ top: node.scrollHeight, behavior: "smooth" });
  };
</script>

<div bind:this={statusList} style="height:100%;overflow:auto;">
  <h3>statusbar</h3>
  <Spinner size="1em" color="var(--primary-color)" />

  {#each $statusData as status}
    <p>{@html status.display}</p>
  {/each}
  <p>debugging</p>
  <button on:click={() => console.log($data)}>data</button>
  <button on:click={() => console.log($graphs)}>graphs</button>
</div>
