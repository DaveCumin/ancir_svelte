<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab } from "../../store";
  import { tooltip } from "../../utils/Tooltip/Tooltip";
  import { rgbaTorgba } from "../../utils/Color";
  import { scaleLinear } from "d3-scale";
  import Axis from "../Axis.svelte";

  const margin = { top: 20, bottom: 50, left: 50, right: 20 };

  $: width = $graphs[$activeGraphTab].params.width;
  $: height = $graphs[$activeGraphTab].params.height;
  $: innerHeight = height - margin.top - margin.bottom;
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

    if ($graphs[$activeGraphTab].graph === "raw") {
      $graphs[$activeGraphTab].sourceData.forEach((plotData) => {
        const theDataIndex = $data.findIndex((d) => d.id === plotData.tableID);
        if (plotData.chartvalues.x.field != "") {
          if (plotData.chartvalues.x.processedData.length > 0) {
            //check for processed graph data
            xVals = plotData.chartvalues.x.processedData;
          } else {
            if (
              //check for processed data
              $data[theDataIndex].data[plotData.chartvalues.x.field]
                .processedData.length > 0
            ) {
              xVals =
                $data[theDataIndex].data[plotData.chartvalues.x.field]
                  .processedData;
            } else {
              xVals =
                $data[theDataIndex].data[plotData.chartvalues.x.field].data;
            }
          }
        }
        if (plotData.chartvalues.y.field != "") {
          if (plotData.chartvalues.y.processedData.length > 0) {
            //check for processed graph data
            yVals = plotData.chartvalues.y.processedData;
          } else {
            if (
              $data[theDataIndex].data[plotData.chartvalues.y.field]
                .processedData.length > 0
            ) {
              yVals =
                $data[theDataIndex].data[plotData.chartvalues.y.field]
                  .processedData;
            } else {
              yVals =
                $data[theDataIndex].data[plotData.chartvalues.y.field].data;
            }
          }
        }
        xValsToPlot.push(xVals);
        yValsToPlot.push(yVals);
      });

      xScale = scaleLinear()
        .domain([
          $graphs[$activeGraphTab].params.xDomainMin,
          $graphs[$activeGraphTab].params.xDomainMax,
        ])
        .range([0, innerWidth]);
      yScale = scaleLinear()
        .domain([
          $graphs[$activeGraphTab].params.yDomainMin,
          $graphs[$activeGraphTab].params.yDomainMax,
        ])
        .range([innerHeight, 0]);
    }
  }
</script>

{#if $graphs[$activeGraphTab].graph === "raw"}
  <div class="rawGraph">
    <svg {width} {height} style="border: 1px solid #000;">
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
              fill={$graphs[$activeGraphTab].sourceData[sourceI].col.hex}
              fill-opacity={$graphs[$activeGraphTab].sourceData[sourceI].col
                .alpha}
            />
          {/each}
        {/each}

        <!-- axis stuff-->
        <Axis {innerHeight} {margin} scale={xScale} position="bottom" />
        <Axis {innerHeight} {margin} scale={yScale} position="left" />

        <text
          style="text-anchor: middle;"
          transform={`translate(-30,${innerHeight / 2}) rotate(-90)     `}
          >{$graphs[$activeGraphTab].params.yAxisLabel}</text
        >
        <text
          style="text-anchor: middle;"
          x={innerWidth / 2}
          y={innerHeight + 32}
          >{$graphs[$activeGraphTab].params.xAxisLabel}</text
        >
      </g>
    </svg>
  </div>
{/if}
