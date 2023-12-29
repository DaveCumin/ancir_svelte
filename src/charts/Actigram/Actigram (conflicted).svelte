<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab } from "../../store";
  import { tooltip } from "../../utils/Tooltip/Tooltip";
  import { scaleLinear } from "d3-scale";
  import Axis from "../Axis.svelte";
  import { getstartTimeOffset } from "../../utils/time/TimeUtils";
  import { createSequenceArray } from "../../utils/MathsStats";

  let startTime;
  let startOffsets;
  let doublePlot = 2;

  const margin = { top: 20, bottom: 50, left: 50, right: 20 };
  $: periodHrs = $graphs[$activeGraphTab].params.periodHrs;

  $: width = $graphs[$activeGraphTab].params.width;
  $: dayHeight = $graphs[$activeGraphTab].params.dayHeight;
  $: betweenHeight = $graphs[$activeGraphTab].params.betweenHeight;
  $: totalHeight =
    margin.top + margin.bottom + (dayHeight + betweenHeight) * days;
  $: innerHeight = totalHeight - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;
  $: days = Math.ceil(Math.max(...xValsToPlot.flat()) / periodHrs);

  $: {
    startTime = $graphs[$activeGraphTab].params.startTime;

    console.log("startTime: " + startTime);

    // Make sure the plot is correct and there is data
    if (
      $graphs[$activeGraphTab].graph === "actigram" &&
      $graphs[$activeGraphTab].sourceData.length > 0
    ) {
      startOffsets = Array.from(
        { length: $graphs[$activeGraphTab].sourceData.length },
        () => 0
      );
      for (
        let sinx = 0;
        sinx < $graphs[$activeGraphTab].sourceData.length;
        sinx++
      ) {
        const plotTimeField =
          $graphs[$activeGraphTab].sourceData[sinx].chartvalues.time.field;
        const theDataIndex = $data.findIndex(
          (d) => d.id === $graphs[$activeGraphTab].sourceData[sinx].tableID
        );

        //Do stuff for time to get the offset
        if ($data[theDataIndex].data[plotTimeField].type == "time") {
          const tempDate = $data[theDataIndex].data[plotTimeField].data[0];

          startOffsets[sinx] = getstartTimeOffset(
            startTime,
            tempDate,
            $data[theDataIndex].data[plotTimeField].timeFormat
          );
        }
      }
    }
  }

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
    }
  }
  $: {
    xScale = scaleLinear()
      .domain([0, periodHrs * doublePlot])
      .range([0, innerWidth]);
    yScale = scaleLinear()
      .domain([
        Math.min(...yValsToPlot.flat()),
        Math.max(...yValsToPlot.flat()),
      ])
      .range([dayHeight, 0]);
  }

  function createActiPath(ys, sourceI, d) {
    console.log(ys);
    console.log(xValsToPlot[sourceI]);
    const halfbarwidth = xScale(1 / 2);
    let day = 0;
    const pathData = ys
      .filter(
        (value) =>
          value >= d * (periodHrs * doublePlot) &&
          value <= (d + 1) * (periodHrs * doublePlot)
      ) // Only get the data for the given double plot
      .map((y, yi) => {
        const x = xScale(
          (xValsToPlot[sourceI][yi] + startOffsets[sourceI]) %
            (periodHrs * doublePlot)
        );
        const ydayoffset = d * (dayHeight + betweenHeight);

        const yout = yScale(y) + ydayoffset;

        return `${x - halfbarwidth},${ydayoffset}  ${
          x - halfbarwidth
        },${yout} ${x + halfbarwidth},${yout} ${
          x + halfbarwidth
        },${ydayoffset}`;
      })
      .join(" ");

    // Ensure the path starts at [0, 0]
    const moveToStart = `0,${dayHeight}`;

    // Ensure the path returns to [0, 0] from [periodHrs, 0]
    const moveToReturn = `${xScale(periodHrs)},${
      innerHeight - betweenHeight
    } 0,${innerHeight - betweenHeight}`;

    // Close the path by connecting the last point to the first point
    return `M${moveToStart} ${pathData} ${moveToReturn} Z`;
  }
</script>

{#if $graphs[$activeGraphTab].graph === "actigram"}
  <div class="actigramGraph">
    <svg {width} height={totalHeight} style="border: 1px solid #000;">
      <g transform={`translate(${margin.left},${margin.right})`}>
        {#if yValsToPlot.length > 0}
          {#each createSequenceArray(0, days - 1) as d}
            {#each yValsToPlot as ys, sourceI}
              <path
                d={createActiPath(ys, sourceI, d)}
                fill={$graphs[$activeGraphTab].sourceData[sourceI].col.hex}
                fill-opacity={$graphs[$activeGraphTab].sourceData[sourceI].col
                  .alpha}
              />
            {/each}
          {/each}

          <!-- Points, just for testing; this can be removed later-->
          {#each yValsToPlot as ys, sourceI}
            {#each ys as y, yi}
              <circle
                use:tooltip
                cx={xScale(
                  (xValsToPlot[sourceI][yi] + startOffsets[sourceI]) % periodHrs
                )}
                cy={yScale(y) +
                  Math.floor(xValsToPlot[sourceI][yi] / periodHrs) *
                    (dayHeight + betweenHeight)}
                r="2"
                stroke="black"
                stroke-width="1"
                fill={$graphs[$activeGraphTab].sourceData[sourceI].col.hex}
                fill-opacity={$graphs[$activeGraphTab].sourceData[sourceI].col
                  .alpha}
              />
              {#if (xValsToPlot[sourceI][yi] + startOffsets[sourceI]) % periodHrs === 0}
                <!-- if it's on a border and there's another day to go, add the point to the previous day also-->
                <circle
                  use:tooltip
                  cx={xScale(periodHrs)}
                  cy={yScale(y) +
                    (Math.floor(xValsToPlot[sourceI][yi] / periodHrs) - 1) *
                      (dayHeight + betweenHeight)}
                  r="2"
                  stroke="black"
                  stroke-width="1"
                  fill={$graphs[$activeGraphTab].sourceData[sourceI].col.hex}
                  fill-opacity={$graphs[$activeGraphTab].sourceData[sourceI].col
                    .alpha}
                />
              {/if}
            {/each}
          {/each}
        {:else}
          <text x="50%" y="50%" text-anchor="middle" fill="red"> </text>
        {/if}

        <!-- axis stuff-->
        <Axis {innerHeight} yoffset="0" scale={xScale} position="bottom" />
        <Axis {innerHeight} yoffset="0" scale={yScale} position="left" />
      </g>
    </svg>
  </div>
{/if}
