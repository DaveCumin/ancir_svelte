<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab } from "../../store";
  import { tooltip } from "../../utils/Tooltip/Tooltip";
  import { scaleLinear } from "d3-scale";
  import Axis from "../Axis.svelte";
  import { getstartTimeOffset } from "../../utils/time/TimeUtils";

  let days = 1;
  let startTime;
  let startOffset;

  const margin = { top: 20, bottom: 50, left: 50, right: 20 };
  $: periodHrs = $graphs[$activeGraphTab].params.periodHrs;

  $: width = $graphs[$activeGraphTab].params.width;
  $: dayHeight = $graphs[$activeGraphTab].params.dayHeight;
  $: betweenHeight = $graphs[$activeGraphTab].params.betweenHeight;
  $: totalHeight = (dayHeight + betweenHeight) * days;
  $: innerHeight = totalHeight - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;
  $: {
    startTime = $graphs[$activeGraphTab].params.startTime;
  }

  let xValsToPlot = [];
  let yValsToPlot = [];

  let xScale;
  let yScale;

  // Set the start time
  $: {
    // Make sure the plot is correct and there is data
    if (
      $graphs[$activeGraphTab].graph === "actigram" &&
      $graphs[$activeGraphTab].sourceData.length > 0
    ) {
      const plotData = $graphs[$activeGraphTab].sourceData[0];
      const theDataIndex = $data.findIndex(
        (d) => d.id === $graphs[$activeGraphTab].sourceData[0].tableID
      );

      //Do stuff for time
      if (
        $data[theDataIndex].data[plotData.chartvalues.time.field].type == "time"
      ) {
        const tempDate =
          $data[theDataIndex].data[plotData.chartvalues.time.field].data[0];
        console.log(startTime);
        console.log(tempDate);
        console.log(
          $data[theDataIndex].data[plotData.chartvalues.time.field].timeFormat
        );

        console.log($graphs[$activeGraphTab]);

        startOffset = getstartTimeOffset(
          startTime,
          tempDate,
          $data[theDataIndex].data[plotData.chartvalues.time.field].timeFormat
        );
        console.log(startOffset);
      }
    }
  }
  //This makes the data required for the plot; reactive to any changes
  $: {
    xValsToPlot = [];
    yValsToPlot = [];

    let xVals;
    let yVals;

    if ($graphs[$activeGraphTab].graph === "actigram") {
      $graphs[$activeGraphTab].sourceData.forEach((plotData) => {
        const theDataIndex = $data.findIndex((d) => d.id === plotData.tableID);
        if (plotData.chartvalues.time.field != "") {
          if (plotData.chartvalues.time.processedData.length > 0) {
            //check for processed graph data
            xVals = plotData.chartvalues.time.processedData;
          } else {
            if (
              //check for processed data
              $data[theDataIndex].data[plotData.chartvalues.time.field]
                .processedData.length > 0
            ) {
              xVals =
                $data[theDataIndex].data[plotData.chartvalues.time.field]
                  .processedData;
            } else {
              xVals =
                $data[theDataIndex].data[plotData.chartvalues.time.field].data;
            }
          }
        }

        if (plotData.chartvalues.values.field != "") {
          if (plotData.chartvalues.values.processedData.length > 0) {
            //check for processed graph data
            yVals = plotData.chartvalues.values.processedData;
          } else {
            if (
              $data[theDataIndex].data[plotData.chartvalues.values.field]
                .processedData.length > 0
            ) {
              yVals =
                $data[theDataIndex].data[plotData.chartvalues.values.field]
                  .processedData;
            } else {
              yVals =
                $data[theDataIndex].data[plotData.chartvalues.values.field]
                  .data;
            }
          }
        }
        xValsToPlot.push(xVals);
        yValsToPlot.push(yVals);
      });

      xScale = scaleLinear().domain([0, periodHrs]).range([0, innerWidth]);
      yScale = scaleLinear().domain([0, 20]).range([innerHeight, 0]);
    }
  }
</script>

{#if $graphs[$activeGraphTab].graph === "actigram"}
  <div class="actigramGraph">
    <svg {width} height={totalHeight} style="border: 1px solid #000;">
      <g transform={`translate(${margin.left},${margin.right})`}>
        {#if yValsToPlot.length > 0}
          {#each yValsToPlot as ys, sourceI}
            {#each ys as y, yi}
              <circle
                use:tooltip
                cx={xScale(xValsToPlot[sourceI][yi])}
                cy={yScale(y)}
                r="2"
                fill={$graphs[$activeGraphTab].sourceData[sourceI].col.hex}
                fill-opacity={$graphs[$activeGraphTab].sourceData[sourceI].col
                  .alpha}
              />
            {/each}
          {/each}
        {:else}
          <text x="50%" y="50%" text-anchor="middle" fill="red"> </text>
        {/if}

        <!-- axis stuff-->
        <Axis {innerHeight} {margin} scale={xScale} position="bottom" />
        <Axis {innerHeight} {margin} scale={yScale} position="left" />
      </g>
    </svg>
  </div>
{/if}
