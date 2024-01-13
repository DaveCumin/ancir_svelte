<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab, statusData } from "../../store";
  import { scaleLinear } from "d3-scale";
  import Axis from "../Axis.svelte";
  import { getstartTimeOffset } from "../../utils/time/TimeUtils";
  import { createSequenceArray } from "../../utils/MathsStats";
  import { getDataFromTable } from "../../data/handleData";
  import { averageBinnedValues } from "../../data/handleData";

  let mousedown = false;

  let startTime;
  let startOffsets = Array.from(
    { length: $graphs[$activeGraphTab].sourceData.length },
    () => 0
  );
  let doublePlot = 2;
  let actPaths;
  let days = 1;
  let xValsToPlot = [];
  let yValsToPlot = [];

  let xScale = scaleLinear()
    .domain([0, $graphs[$activeGraphTab].params.periodHrs * doublePlot])
    .range([0, innerWidth]);
  let yScale = scaleLinear().domain([0, 100]).range([dayHeight, 0]);

  let totalHeight;

  const margin = { top: 50, bottom: 20, left: 50, right: 20 };

  $: binSize = $graphs[$activeGraphTab].params.binSizeHrs;

  $: width = $graphs[$activeGraphTab].params.width;
  $: dayHeight = $graphs[$activeGraphTab].params.dayHeight;
  $: betweenHeight = $graphs[$activeGraphTab].params.betweenHeight;
  $: {
    totalHeight =
      margin.top +
      margin.bottom +
      (dayHeight + betweenHeight) * days -
      betweenHeight;

    if (totalHeight < margin.top + margin.bottom) {
      totalHeight = margin.top + margin.bottom;
    }
  }
  $: innerHeight = totalHeight - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;

  //UPDATE THE OFFSETS
  $: {
    //TODO: Change the start time when new data is added; to be the 00:00 of the first day of the data (here or in ChartMaster?)
    startTime = $graphs[$activeGraphTab].params.startTime;

    // Make sure the plot is correct and there is data
    if (
      $graphs[$activeGraphTab].graph === "actigram" &&
      $graphs[$activeGraphTab].sourceData.length > 0
    ) {
      updateOffsets();
      $graphs[$activeGraphTab].graph = $graphs[$activeGraphTab].graph;
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

  function makePlotData() {
    xValsToPlot = [];
    yValsToPlot = [];

    let xVals;
    let yVals;

    let chartData = {
      chartMins: [],
      chartMaxs: [],
      data: { time: [], values: [], mins: [], maxs: [] },
    };
    //console.log($graphs[$activeGraphTab]);
    //console.log($data);
    //check the graph is correct
    if ($graphs[$activeGraphTab].graph === "actigram") {
      //for each source data
      $graphs[$activeGraphTab].sourceData.forEach((plotData, sourceIdx) => {
        //Get the time (x-axis) data
        if (plotData.chartvalues.time.field != "") {
          xVals = getDataFromTable(
            plotData.tableID,
            plotData.chartvalues.time.field
          );
        }

        //Get the values (y-axis) data
        if (plotData.chartvalues.values.field != "") {
          yVals = getDataFromTable(
            plotData.tableID,
            plotData.chartvalues.values.field
          );
        }

        //do the binning
        const binnedData = averageBinnedValues(
          xVals,
          yVals,
          $graphs[$activeGraphTab].params.binSizeHrs
        );

        //set up the plot data
        const nonanValues = binnedData.values.filter((num) => !isNaN(num));
        chartData.chartMins[sourceIdx] = Math.min(...nonanValues); // overall min and max
        chartData.chartMaxs[sourceIdx] = Math.max(...nonanValues);
        chartData.data.time[sourceIdx] = []; //set up for the days data
        chartData.data.values[sourceIdx] = [];
        chartData.data.mins[sourceIdx] = [];
        chartData.data.maxs[sourceIdx] = [];

        const periodHrs = $graphs[$activeGraphTab].params.periodHrs;
        for (let i = 0; i < binnedData.time.length; i++) {
          //get the plot number
          const plotNum = Math.floor(
            binnedData.time[i] / (periodHrs * doublePlot)
          );

          // Initialize the array if it's undefined
          if (!chartData.data.time[sourceIdx][plotNum]) {
            chartData.data.time[sourceIdx][plotNum] = [];
            chartData.data.values[sourceIdx][plotNum] = [];
          }
          // Push values into the array
          chartData.data.time[sourceIdx][plotNum].push(binnedData.time[i]);
          chartData.data.values[sourceIdx][plotNum].push(binnedData.values[i]);
        }
        //get the mins and maxes
        for (let i = 0; i < chartData.data.time[sourceIdx].length; i++) {
          chartData.data.mins[sourceIdx][i] = Math.min(
            ...chartData.data.values[sourceIdx][i].filter((num) => !isNaN(num))
          );
          chartData.data.maxs[sourceIdx][i] = Math.max(
            ...chartData.data.values[sourceIdx][i].filter((num) => !isNaN(num))
          );
        }
        //console.log(chartData);

        //THIS IS NOW OLD! TO REMOVE WHEN THE chartData is working
        //TODO: change this so it becomes an array of arrays, by day: eg, [[d1[s1][s2]]...]
        xValsToPlot.push(binnedData.time);
        yValsToPlot.push(binnedData.values);
      });

      // update the scales
      xScale = scaleLinear()
        .domain([0, $graphs[$activeGraphTab].params.periodHrs * doublePlot])
        .range([0, innerWidth]);
      yScale = scaleLinear()
        .domain([
          Math.min(...yValsToPlot.flat().filter((num) => !isNaN(num))),
          Math.max(...yValsToPlot.flat().filter((num) => !isNaN(num))),
        ])
        .range([dayHeight, 0]);
    }
  }

  //This makes the data required for the plot; reactive to any changes
  $: {
    if (
      $graphs[$activeGraphTab].graph === "actigram" &&
      $graphs[$activeGraphTab].sourceData.length > 0
    ) {
      $graphs[$activeGraphTab].graph = $graphs[$activeGraphTab].graph;
      $graphs[$activeGraphTab].sourceData = $graphs[$activeGraphTab].sourceData;

      makePlotData();

      //update the days
      days = Math.ceil(
        Math.max(...xValsToPlot.flat().filter((num) => !isNaN(num))) /
          $graphs[$activeGraphTab].params.periodHrs
      );

      //update the offsets
      startOffsets = updateOffsets();

      //make the paths
      actPaths = createActipathArray(xValsToPlot, yValsToPlot);
    }
  }

  function createActipathArray(xin, yin) {
    const periodHrs = $graphs[$activeGraphTab].params.periodHrs;
    const halfbarwidthScaled = xScale(binSize / 2);

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

        // for each point, make the path proper (NB, the for loop is faster than alternatives https://hackernoon.com/performance-tests-on-common-javascript-array-methods)
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
            xin[srcIndex][i] != undefined &&
            !isNaN(xin[srcIndex][i]) &&
            yin[srcIndex][i] != null &&
            yin[srcIndex][i] != undefined &&
            !isNaN(yin[srcIndex][i])
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

  function mouseToPoint(e) {
    const clickedDay = Math.floor(
      (e.offsetY - margin.top) / (dayHeight + betweenHeight)
    );
    const clickedHrs =
      ((e.offsetX - margin.left) / innerWidth) * periodHrs * doublePlot;

    const clickedTime = clickedDay * periodHrs + clickedHrs;

    $statusData.push({
      display: clickedHrs + ", " + clickedDay + " -> " + clickedTime,
    });
    $statusData = $statusData;
  }
</script>

{#if $graphs[$activeGraphTab].graph === "actigram" && $graphs[$activeGraphTab].sourceData.length > 0}
  <div class="actigramGraph">
    <svg
      {width}
      height={totalHeight}
      on:mousedown={(e) => {
        mousedown = true;
        mouseToPoint(e);
      }}
      on:mousemove={(e) => {
        if (mousedown) {
          e.preventDefault();
          mouseToPoint(e);
        }
      }}
      on:mouseup={(e) => {
        mousedown = false;
        mouseToPoint(e);
      }}
      on:dblclick={(e) => {
        e.preventDefault();
        mouseToPoint(e);
      }}
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
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
            <Axis
              {innerHeight}
              yoffset={d * (dayHeight + betweenHeight)}
              scale={yScale}
              position="left"
              nticks={dayHeight / 15}
            />
          {/each}
        {:else}
          <text x="50%" y="50%" text-anchor="middle" fill="red"> </text>
        {/if}

        <!-- axis stuff-->
        <Axis
          {innerHeight}
          yoffset="0"
          scale={xScale}
          position="top"
          nticks={$graphs[$activeGraphTab].params.periodHrs}
        />
      </g>
    </svg>
  </div>
{/if}
