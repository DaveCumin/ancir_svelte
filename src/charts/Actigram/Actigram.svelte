<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab } from "../../store";
  import { tooltip } from "../../utils/Tooltip/Tooltip";
  import { rgbaTorgba } from "../../utils/Color";
  import { scaleLinear } from "d3-scale";
  import Axis from "../Axis.svelte";

  let days = 3; //Can code this later
  const margin = { top: 20, bottom: 50, left: 50, right: 20 };

  $: width = $graphs[$activeGraphTab].params.width;
  $: dayHeight = $graphs[$activeGraphTab].params.dayHeight;
  $: betweenHeight = $graphs[$activeGraphTab].params.betweenHeight;
  $: totalHeight = (dayHeight + betweenHeight) * days;
  $: innerHeight = totalHeight - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;

  let xValsToPlot = [];
  let yValsToPlot = [];

  let xScale;
  let yScale;

  //This makes the data required for the plot; reactive to any changes
  $: {
    xValsToPlot = [];
    yValsToPlot = [];

    let xVals;
    let yVals;

    $graphs[$activeGraphTab].sourceData.forEach((plotData) => {
      const theDataIndex = $data.findIndex((d) => d.id === plotData.tableID);
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
        if (
          $data[theDataIndex].data[plotData.y.field].processedData.length > 0
        ) {
          yVals = $data[theDataIndex].data[plotData.y.field].processedData;
        } else {
          yVals = $data[theDataIndex].data[plotData.y.field].data;
        }
      }

      xValsToPlot.push(xVals);
      yValsToPlot.push(yVals);
    });

    xScale = scaleLinear().domain([0, 20]).range([0, innerWidth]);
    yScale = scaleLinear().domain([0, 20]).range([innerHeight, 0]);
  }
</script>

<div class="actigramGraph" style="overflow:auto;">
  {innerHeight} <br />
  {xValsToPlot}<br />
  {yValsToPlot}<br />
  <svg {width} height={totalHeight} style="border: 1px solid #000;">
    <g transform={`translate(${margin.left},${margin.right})`}>
      {#each yValsToPlot as ys, sourceI}
        {#each ys as y, yi}
          <circle
            use:tooltip
            cx={xScale(xValsToPlot[sourceI][yi])}
            cy={yScale(y)}
            r="10"
            stroke="black"
            stroke-width="3"
            fill={rgbaTorgba($graphs[$activeGraphTab].sourceData[sourceI].col)}
          />
        {/each}
      {/each}

      <!-- axis stuff-->
      <text transform={`translate(${-30},${innerHeight / 2}) rotate(-90)`}
        >y-axis title</text
      >
      <text x={innerWidth / 2} y={innerHeight + 30}>x-axis title</text>

      <Axis {innerHeight} {margin} scale={xScale} position="bottom" />
      <Axis {innerHeight} {margin} scale={yScale} position="left" />
    </g>
  </svg>
</div>
