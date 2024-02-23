<script>
  // @ts-nocheck
  // @ts-ignore

  import { graphs, activeGraphTab } from "../store";
  import { updateGraphProcess } from "../components/ProcessStep.svelte";

  import { onMount } from "svelte";

  //force the refresh from the start
  onMount(() => {
    updateGraphProcess($activeGraphTab, 0, "time");
    updateGraphProcess($activeGraphTab, 1, "time");
    $graphs[$activeGraphTab].params.dayHeight = 15;
  });
</script>
