<script>
  import { tooltip } from "../components/Tooltip/Tooltip";

  // @ts-nocheck

  import { data, graphs, activeGraphTab } from "../store";

  $: width = $graphs[$activeGraphTab].params.width;
  $: dayHeight = $graphs[$activeGraphTab].params.dayHeight;
  $: betweenHeight = $graphs[$activeGraphTab].params.betweenHeight;

  let days = 3; //Can code this later
  $: totalHeight = (dayHeight + betweenHeight) * days;

  function getTheDataPoints(plotData, d, g) {
    let xVals;
    let yVals;
    if (plotData.x.processedData.length > 0) {
      //check for processed graph data
      xVals = plotData.x.processedData;
    } else {
      if (
        //check for processed data
        $data[plotData.tableID].data[plotData.x.field].processedData.length > 0
      ) {
        xVals = $data[plotData.tableID].data[plotData.x.field].processedData;
      } else {
        xVals = $data[plotData.tableID].data[plotData.x.field].data;
      }
    }

    if (plotData.y.processedData.length > 0) {
      //check for processed graph data
      yVals = plotData.y.processedData;
    } else {
      if (
        $data[plotData.tableID].data[plotData.y.field].processedData.length > 0
      ) {
        yVals = $data[plotData.tableID].data[plotData.y.field].processedData;
      } else {
        yVals = $data[plotData.tableID].data[plotData.y.field].data;
      }
    }

    return { x: xVals, y: yVals };
  }
</script>

<div>
  {#each $graphs[$activeGraphTab].sourceData as plotData, i}
    {JSON.stringify(getTheDataPoints(plotData, $data, $graphs))}
    <br />
  {/each}
  <br />
  {width}, {dayHeight}, {betweenHeight}
  <br />
</div>

<div class="actigramGraph">
  <svg {width} {totalHeight}>
    {#each $graphs[$activeGraphTab].sourceData as plotData, i}
      {#each Array(3) as _, day}
        <circle
        use:tooltip
          cx={getTheDataPoints(plotData, $data, $graphs).y[day] * 15}
          cy={getTheDataPoints(plotData, $data, $graphs).y[day] * 10}
          r="10"
          stroke="black"
          stroke-width="3"
          fill="red"
        />
      {/each}
    {/each}
  </svg>
</div>
