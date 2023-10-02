<script>
  import { data, graphs, activeGraphTab } from "../store";

  $: width = $graphs[$activeGraphTab].params.width;
  $: dayHeight = $graphs[$activeGraphTab].params.dayHeight;
  $: betweenHeight = $graphs[$activeGraphTab].params.betweenHeight;

  function getTheDataPoints(plotData, d) {
    let xVals;
    let yVals;
    if ($data[plotData.tableID].data[plotData.x].processedData.length > 0) {
      xVals = $data[plotData.tableID].data[plotData.x].processedData;
    } else {
      xVals = $data[plotData.tableID].data[plotData.x].data;
    }

    if ($data[plotData.tableID].data[plotData.y].processedData.length > 0) {
      yVals = $data[plotData.tableID].data[plotData.y].processedData;
    } else {
      yVals = $data[plotData.tableID].data[plotData.y].data;
    }

    return { x: xVals, y: yVals };
  }
</script>

<div>
  {#each $graphs[$activeGraphTab].sourceData as plotData, i}
    {JSON.stringify(getTheDataPoints(plotData, $data))}
    <br />
    {width}, {dayHeight}, {betweenHeight}
    <br />
  {/each}
</div>
