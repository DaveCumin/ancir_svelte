<script>
  // @ts-nocheck
  // imports
  import { data, graphs, activeGraphTab } from "../../store";
  import { getDataFromSource } from "../../data/handleData";
  import { scaleLinear } from "d3-scale";
  import Axis from "../Axis.svelte";
  import { tooltip } from "../../utils/Tooltip/tooltip";

  //Do the plot
  const margin = { top: 20, bottom: 60, left: 60, right: 20 };

  $: width = $graphs[$activeGraphTab]?.params.width;
  $: height = $graphs[$activeGraphTab]?.params.height;
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

    if ($graphs[$activeGraphTab]?.graph === "Raw") {
      $graphs[$activeGraphTab].sourceData.forEach((plotData, sourceIndex) => {
        const theDataIndex = $data.findIndex((d) => d.id === plotData.tableID);
        //get the x data
        if (plotData.chartvalues.x.field != "") {
          xVals = getDataFromSource(sourceIndex, plotData.chartvalues.x);
        }

        //get the y data
        if (plotData.chartvalues.y.field != "") {
          yVals = getDataFromSource(sourceIndex, plotData.chartvalues.y);
        }

        //put the data into the chart
        xValsToPlot.push(xVals);
        yValsToPlot.push(yVals);
      });

      // set up the scales
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

{#if $graphs[$activeGraphTab]?.graph === "Raw" && $graphs[$activeGraphTab]?.sourceData.length > 0}
  <div class="rawGraph">
    <svg
      id="svgContainer"
      {width}
      {height}
      style={"transform-origin: top left; transform:scale(" +
        $graphs[$activeGraphTab].zoom +
        ");"}
    >
      <g transform={`translate(${margin.left},${margin.right})`}>
        {#each yValsToPlot as ys, sourceI}
          {#each ys as y, yi}
            {#if y !== null && !isNaN(y) && xValsToPlot[sourceI][yi] !== null && !isNaN(xValsToPlot[sourceI][yi])}
              <circle
                use:tooltip
                tipcontent={xValsToPlot[sourceI][yi] + ", " + y}
                cx={xScale(xValsToPlot[sourceI][yi])}
                cy={yScale(y)}
                r={$graphs[$activeGraphTab].sourceData[sourceI].size}
                stroke={$graphs[$activeGraphTab].sourceData[sourceI].strokeCol
                  .hex}
                stroke-opacity={$graphs[$activeGraphTab].sourceData[sourceI]
                  .strokeCol.alpha}
                stroke-width={$graphs[$activeGraphTab].sourceData[sourceI]
                  .strokeWidth}
                fill={$graphs[$activeGraphTab].sourceData[sourceI].col.hex}
                fill-opacity={$graphs[$activeGraphTab].sourceData[sourceI].col
                  .alpha}
              />
            {/if}
          {/each}
        {/each}

        <!-- axis stuff-->
        <Axis {innerHeight} scale={xScale} position="bottom" />
        <Axis {innerHeight} scale={yScale} position="left" />

        <!-- TODO_low: move the label and margins for when there are high numbers on the axis (so the label and ticks don't overlap) -->
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
