<script>
  import ChartGRaphData_xyc from "../ChartGraphData_xyc.svelte";
  import Slider from "../../utils/Slider.svelte";
  import {
    data,
    graphs,
    activeGraphTab,
    dataIDsforTables,
    activeTableTab,
  } from "../../store";
</script>

<ChartGRaphData_xyc />
<div>
  <label for="val">Width:</label>
  <input
    type="number"
    id="min"
    bind:value={$graphs[$activeGraphTab].params.width}
  />
  <Slider
    min={100}
    max={1000}
    bind:value={$graphs[$activeGraphTab].params.width}
  />
</div>

<div>
  <label for="val">dayHeight:</label>
  <input
    type="number"
    id="min"
    bind:value={$graphs[$activeGraphTab].params.dayHeight}
  />
  <Slider
    min={10}
    max={30}
    bind:value={$graphs[$activeGraphTab].params.dayHeight}
  />
</div>

<div>
  <label for="val">betweenHeight:</label>
  <input
    type="number"
    id="min"
    bind:value={$graphs[$activeGraphTab].params.betweenHeight}
  />
  <Slider
    min={1}
    max={20}
    bind:value={$graphs[$activeGraphTab].params.betweenHeight}
  />
</div>
