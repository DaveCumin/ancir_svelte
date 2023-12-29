<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab } from "../../store";
  import { tooltip } from "../../utils/Tooltip/Tooltip";
  import { scaleLinear } from "d3-scale";
  import Axis from "../Axis.svelte";
  import { getstartTimeOffset } from "../../utils/time/TimeUtils";
  import { createSequenceArray } from "../../utils/MathsStats";

  let startTime;
  //TODO: The startOffsets isn't working that well for some reason
  let startOffsets = Array.from(
    { length: $graphs[$activeGraphTab].sourceData.length },
    () => 0
  );
  let doublePlot = 2;
  let halfbarwidth = 0.08 / 2;
  let actPaths;
  let days = 1;
  let xValsToPlot = [];
  let yValsToPlot = [];

  let xScale;
  let yScale;

  const margin = { top: 20, bottom: 50, left: 50, right: 20 };
  $: periodHrs = $graphs[$activeGraphTab].params.periodHrs;

  $: width = $graphs[$activeGraphTab].params.width;
  $: dayHeight = $graphs[$activeGraphTab].params.dayHeight;
  $: betweenHeight = $graphs[$activeGraphTab].params.betweenHeight;
  $: totalHeight =
    margin.top +
    margin.bottom +
    (dayHeight + betweenHeight) * days -
    betweenHeight;
  $: innerHeight = totalHeight - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;

  $: {
    //TODO: Change the start time when new data is added; to be the 00:00 of the first day of the data (to do here or in ChartMaster?)
    startTime = $graphs[$activeGraphTab].params.startTime;

    // Make sure the plot is correct and there is data
    if (
      $graphs[$activeGraphTab].graph === "actigram" &&
      $graphs[$activeGraphTab].sourceData.length > 0
    ) {
      updateOffsets();
    } //the check
  }

  function updateOffsets() {
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
    return startOffsets;
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

      // update the scale
      xScale = scaleLinear()
        .domain([0, periodHrs * doublePlot])
        .range([0, innerWidth]);
      yScale = scaleLinear()
        .domain([
          Math.min(...yValsToPlot.flat().filter((num) => !isNaN(num))),
          Math.max(...yValsToPlot.flat().filter((num) => !isNaN(num))),
        ])
        .range([dayHeight, 0]);

      //update the days
      days = Math.ceil(
        Math.max(...xValsToPlot.flat().filter((num) => !isNaN(num))) / periodHrs
      );

      //update the offsets
      startOffsets = updateOffsets();

      //make the paths
      actPaths = createActipathArray(xValsToPlot, yValsToPlot);
    }
  }

  function createActipathArray(xin, yin) {
    const halfbarwidthScaled = xScale(halfbarwidth);
    //update the days
    days = Math.ceil(
      Math.max(...xin.flat().filter((num) => !isNaN(num))) / periodHrs
    );

    //force refresh
    $graphs[$activeGraphTab].params.dayHeight =
      $graphs[$activeGraphTab].params.dayHeight;
    $graphs[$activeGraphTab].params.startTime =
      $graphs[$activeGraphTab].params.startTime;

    //the paths will be an array of arrays, length [days][sources]
    let actPaths = Array.from({ length: days }, (d) =>
      Array.from({ length: xin.length }, () => "")
    );

    //for each source
    for (let srcIndex = 0; srcIndex < xin.length; srcIndex++) {
      //for each day
      for (let d = 0; d < days; d++) {
        const ydayoffset = d * (dayHeight + betweenHeight);

        // Set up the starting positions
        const moveToStart = `M0,${d * (dayHeight + betweenHeight) + dayHeight}`;
        actPaths[d][srcIndex] = actPaths[d][srcIndex] + moveToStart + " ";

        // for each point, make the path proper
        for (let i = 0; i < xin[srcIndex].length; i++) {
          const yout = yScale(yin[srcIndex][i]) + ydayoffset;
          const xout = xScale(
            xin[srcIndex][i] - d * periodHrs + startOffsets[srcIndex]
          );

          //make the path if the value is not null
          const theNextPathPart = `${xout - halfbarwidthScaled},${
            ydayoffset + dayHeight
          }  ${xout - halfbarwidthScaled},${yout} ${
            xout + halfbarwidthScaled
          },${yout} ${xout + halfbarwidthScaled},${ydayoffset + dayHeight}`;

          //add the path if it should be added
          if (
            xin[srcIndex][i] + startOffsets[srcIndex] >= d * periodHrs &&
            xin[srcIndex][i] + startOffsets[srcIndex] <=
              d * periodHrs + periodHrs * doublePlot &&
            xin[srcIndex][i] != null &&
            xin[srcIndex][i] != undefined
          ) {
            actPaths[d][srcIndex] =
              actPaths[d][srcIndex] + theNextPathPart + " ";
          }
        }

        //make the ending
        const moveToReturn = `${xScale(periodHrs * doublePlot)},${
          d * (dayHeight + betweenHeight) + dayHeight
        } 0,${d * (dayHeight + betweenHeight) + dayHeight}`;

        actPaths[d][srcIndex] = actPaths[d][srcIndex] + moveToReturn + " Z";
      }
    }

    for (let i = 0; i < xin.length; i++) {
      actPaths[Math.floor(xin[i] / (periodHrs * doublePlot))] =
        actPaths[Math.floor(xin[i] / (periodHrs * doublePlot))] +
        xin[i] +
        "," +
        yin[i] +
        " ";
    }

    return actPaths;
  }
</script>

{#if $graphs[$activeGraphTab].graph === "actigram" && $graphs[$activeGraphTab].sourceData.length > 0}
  <div class="actigramGraph">
    <svg {width} height={totalHeight} style="border: 1px solid #000;">
      <g transform={`translate(${margin.left},${margin.right})`}>
        {#if yValsToPlot.length > 0}
          {#each createSequenceArray(0, days - 1) as d}
            {#each yValsToPlot as ys, sourceI}
              <path
                d={actPaths[d][sourceI]}
                fill={$graphs[$activeGraphTab].sourceData[sourceI].col.hex}
                fill-opacity={$graphs[$activeGraphTab].sourceData[sourceI].col
                  .alpha}
              />
            {/each}
            <!--  <Axis
              {innerHeight}
              yoffset={d * (dayHeight + betweenHeight)}
              scale={yScale}
              position="left"
            /> -->
          {/each}
        {:else}
          <text x="50%" y="50%" text-anchor="middle" fill="red"> </text>
        {/if}

        <!-- axis stuff-->
        <Axis {innerHeight} yoffset="0" scale={xScale} position="bottom" />
      </g>
    </svg>
  </div>
{/if}
