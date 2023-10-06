<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab } from "../../store";
  import { tooltip } from "../../utils/Tooltip/Tooltip";
  import { rgbaTorgba } from "../../utils/Color";

  $: width = $graphs[$activeGraphTab].params.width;
  $: dayHeight = $graphs[$activeGraphTab].params.dayHeight;
  $: betweenHeight = $graphs[$activeGraphTab].params.betweenHeight;

  let days = 3; //Can code this later
  $: totalHeight = (dayHeight + betweenHeight) * days;

  function getTheDataPoints(plotData, d, g) {
    let xVals;
    let yVals;
    let theDataIndex = $data.findIndex((d) => d.id === plotData.tableID);

    if (plotData.x.processedData.length > 0) {
      //check for processed graph data
      xVals = plotData.x.processedData;
    } else {
      if (
        //check for processed data
        $data[theDataIndex].data[plotData.x.field].processedData.length > 0
      ) {
        xVals = $data[theDataIndex].data[plotData.x.field].processedData;
      } else {
        xVals = $data[theDataIndex].data[plotData.x.field].data;
      }
    }

    if (plotData.y.processedData.length > 0) {
      //check for processed graph data
      yVals = plotData.y.processedData;
    } else {
      if ($data[theDataIndex].data[plotData.y.field].processedData.length > 0) {
        yVals = $data[theDataIndex].data[plotData.y.field].processedData;
      } else {
        yVals = $data[theDataIndex].data[plotData.y.field].data;
      }
    }

    return { x: xVals, y: yVals };
  }
</script>

<div class="actigramGraph" style="overflow:auto;">
  <svg {width} height={totalHeight} style="border: 1px solid #000;">
    {#each $graphs[$activeGraphTab].sourceData as plotData}
      {#each getTheDataPoints(plotData, $data, $graphs).x as x, p}
        <circle
          use:tooltip
          cx={x * 10}
          cy={getTheDataPoints(plotData, $data, $graphs).y[p] * 10}
          r="10"
          stroke="black"
          stroke-width="3"
          fill={rgbaTorgba(plotData.col)}
        />
      {/each}
    {/each}
  </svg>
</div>
