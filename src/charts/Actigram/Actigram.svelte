<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab, statusData } from "../../store";
  import { scaleLinear } from "d3-scale";
  import Axis from "../Axis.svelte";
  import {
    getstartTimeOffset,
    getISODate,
    addTime,
  } from "../../utils/time/TimeUtils";
  import { createSequenceArray } from "../../utils/MathsStats";
  import { getDataFromSource, getFieldName } from "../../data/handleData";
  import { averageBinnedValues } from "../../data/handleData";

  let margin = { top: 50, bottom: 20, left: 100, right: 100 };

  $graphs[$activeGraphTab].chartData = {
    chartMins: [],
    chartMaxs: [],
    data: { time: [], values: [], mins: [], maxs: [] },
    yScales: [],
    xScale: scaleLinear()
      .domain([
        0,
        $graphs[$activeGraphTab].params.periodHrs *
          $graphs[$activeGraphTab].params.doublePlot,
      ])
      .range([0, innerWidth]),
    startOffsets: [],
  };

  //for highlighting and reporting
  let mousedown = false;
  let mousePos = { x: 0, y: 0 };

  //for drawing
  let actPaths = "";

  $: updateMargins($graphs[$activeGraphTab].params.showAxes);
  function updateMargins(show) {
    if (!show) {
      margin = { top: 50, bottom: 20, left: 50, right: 50 };
    } else {
      margin = { top: 50, bottom: 20, left: 100, right: 100 };
    }
  }

  $: totalHeight = calcTotalHeight(
    margin,
    dayHeight,
    betweenHeight,
    $graphs[$activeGraphTab].params.periodHrs
  );
  $: binSize = $graphs[$activeGraphTab].params.binSizeHrs;
  $: width = $graphs[$activeGraphTab].params.width;
  $: dayHeight = $graphs[$activeGraphTab].params.dayHeight;
  $: betweenHeight = $graphs[$activeGraphTab].params.betweenHeight;
  $: innerHeight = totalHeight - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;

  function calcTotalHeight(margin, dayHeight, betweenHeight, periodHrs) {
    if ($graphs[$activeGraphTab].graph === "actigram") {
      //TODO: something strange in here somewhere - make new actigram first thing after default start. Error re startoffsets
      if (
        $graphs[$activeGraphTab].chartData.startOffsets === undefined ||
        $graphs[$activeGraphTab].chartData.startOffsets.length === 0
      ) {
        makePlotData(
          $graphs[$activeGraphTab].sourceData,
          $graphs[$activeGraphTab].params.binSizeHrs,
          $graphs[$activeGraphTab].params.periodHrs,
          $graphs[$activeGraphTab].params.doublePlot,
          $graphs[$activeGraphTab].params.startTime
        );
      }
      console.log($graphs[$activeGraphTab].chartData);
      const days = $graphs[$activeGraphTab].chartData.data.time[0].length;

      totalHeight =
        margin.top +
        margin.bottom +
        (dayHeight + betweenHeight) * days -
        betweenHeight;

      if (totalHeight < margin.top + margin.bottom) {
        totalHeight = margin.top + margin.bottom;
      }

      return totalHeight;
    }
  }

  //----------------------------------------------------------------------------------------------------
  $: makePlotData(
    $graphs[$activeGraphTab].sourceData,
    $graphs[$activeGraphTab].params.binSizeHrs,
    $graphs[$activeGraphTab].params.periodHrs,
    $graphs[$activeGraphTab].params.doublePlot,
    $graphs[$activeGraphTab].params.startTime
  );

  function makePlotData(
    sourceData,
    binSizeHrs,
    periodHrs,
    doublePlot,
    startTime
  ) {
    if ($graphs[$activeGraphTab].graph === "actigram") {
      let xVals, yVals;

      let chartData = {
        chartMins: [],
        chartMaxs: [],
        data: { time: [], values: [], mins: [], maxs: [] },
        yScales: [],
        xScale: scaleLinear()
          .domain([
            0,
            $graphs[$activeGraphTab].params.periodHrs *
              $graphs[$activeGraphTab].params.doublePlot,
          ])
          .range([0, innerWidth]),
      };

      //for each source data
      sourceData.forEach((plotData, sourceIndex) => {
        //Get the time (x-axis) data
        if (plotData.chartvalues.time.field != "") {
          xVals = getDataFromSource(sourceIndex, plotData.chartvalues.time);
        }

        //Get the values (y-axis) data
        if (plotData.chartvalues.values.field != "") {
          yVals = getDataFromSource(sourceIndex, plotData.chartvalues.values);
        }

        //do the binning
        const binnedData = averageBinnedValues(xVals, yVals, binSizeHrs);

        //update the offsets
        updateOffsets(startTime, $activeGraphTab);

        //set up the plot data
        const nonanValues = binnedData.values.filter((num) => !isNaN(num));
        chartData.chartMins[sourceIndex] = Math.min(...nonanValues); // overall min and max
        chartData.chartMaxs[sourceIndex] = Math.max(...nonanValues);
        chartData.data.time[sourceIndex] = []; //set up for the days data
        chartData.data.values[sourceIndex] = [];
        chartData.data.mins[sourceIndex] = [];
        chartData.data.maxs[sourceIndex] = [];
        chartData.yScales[sourceIndex] = [];

        //put the data in the correct bins
        for (let i = 0; i < binnedData.time.length; i++) {
          //get the plot number
          const plotNum = Math.floor(
            (binnedData.time[i] +
              $graphs[$activeGraphTab].chartData.startOffsets[sourceIndex]) /
              (periodHrs + 0.0000001)
          );

          //put into the double plots as appropriate
          for (let p = 0; p < doublePlot; p++) {
            if (plotNum - p >= 0) {
              // Initialize the array if it's undefined
              if (!chartData.data.time[sourceIndex][plotNum - p]) {
                chartData.data.time[sourceIndex][plotNum - p] = [];
                chartData.data.values[sourceIndex][plotNum - p] = [];
              }
              // Push values into the array
              chartData.data.time[sourceIndex][plotNum - p].push(
                binnedData.time[i] +
                  $graphs[$activeGraphTab].chartData.startOffsets[sourceIndex]
              );
              chartData.data.values[sourceIndex][plotNum - p].push(
                binnedData.values[i]
              );
            }
          }
        }

        //get the mins and maxes
        for (let i = 0; i < chartData.data.time[sourceIndex].length; i++) {
          chartData.data.mins[sourceIndex][i] = Math.min(
            ...chartData.data.values[sourceIndex][i].filter(
              (num) => !isNaN(num)
            )
          );
          chartData.data.maxs[sourceIndex][i] = Math.max(
            ...chartData.data.values[sourceIndex][i].filter(
              (num) => !isNaN(num)
            )
          );
        }
      });

      //now set the data
      $graphs[$activeGraphTab].chartData = chartData;
      //and update the scales - do for each day
      updateScales($graphs[$activeGraphTab].params.scaleAxes);
    }
  }

  $: updateScales(
    $graphs[$activeGraphTab].chartData
      ? $graphs[$activeGraphTab].params.scaleAxes
      : 0
  );

  function updateScales(scaleAxes) {
    if ($graphs[$activeGraphTab].graph === "actigram") {
      $graphs[$activeGraphTab].sourceData.forEach((source, sourceIndex) => {
        $graphs[$activeGraphTab].chartData.data.maxs[sourceIndex].forEach(
          (max, maxIndex) => {
            if ($graphs[$activeGraphTab].params.scaleAxes === "byPlot") {
              $graphs[$activeGraphTab].chartData.yScales[sourceIndex][
                maxIndex
              ] = scaleLinear()
                .domain([
                  $graphs[$activeGraphTab].chartData.data.mins[sourceIndex][
                    maxIndex
                  ],
                  max,
                ])
                .range([dayHeight, 0]);
            }

            if ($graphs[$activeGraphTab].params.scaleAxes === "overall") {
              $graphs[$activeGraphTab].chartData.yScales[sourceIndex][
                maxIndex
              ] = scaleLinear()
                .domain([
                  $graphs[$activeGraphTab].chartData.chartMins[sourceIndex],
                  $graphs[$activeGraphTab].chartData.chartMaxs[sourceIndex],
                ])
                .range([dayHeight, 0]);
            }
          }
        );
      });
    }
  }

  function updateOffsets(startTime, activeGraphT) {
    let startOffsets = [];
    //TODO: Change the start time when new data is added; to be the 00:00 of the first day of the data (here or in ChartMaster?)
    if (
      $graphs[activeGraphT].graph === "actigram" &&
      $graphs[activeGraphT].sourceData.length > 0
    ) {
      //set the up to start with
      startOffsets = Array.from(
        { length: $graphs[activeGraphT].sourceData.length },
        () => 0
      );

      for (
        let sinx = 0;
        sinx < $graphs[activeGraphT].sourceData.length;
        sinx++
      ) {
        const plotTimeField =
          $graphs[activeGraphT].sourceData[sinx].chartvalues.time.field;
        const theDataIndex = $data.findIndex(
          (d) => d.id === $graphs[activeGraphT].sourceData[sinx].tableID
        );

        //Do stuff for time to get the offset
        if ($data[theDataIndex].data[plotTimeField].type == "time") {
          const tempDate = $data[theDataIndex].data[plotTimeField].data[0];

          startOffsets[sinx] = getstartTimeOffset(
            startTime,
            tempDate,
            $data[theDataIndex].data[plotTimeField].timeFormat
          );

          //do a check that it's not more than periodHrs*binSize away
          const max =
            $graphs[$activeGraphTab].params.periodHrs *
            $graphs[$activeGraphTab].params.doublePlot;

          //Check that the offset time isn't more than the graph width, otherwise force a reset.
          if (startOffsets[sinx] >= max) {
            startOffsets[sinx] = 0;
            $graphs[$activeGraphTab].params.startTime = getISODate(
              tempDate,
              $data[theDataIndex].data[plotTimeField].timeFormat
            );
          }
        }
      }
    } else {
      //set the up to start with
      startOffsets = Array.from({ length: 1 }, () => 0);
    }
    $graphs[$activeGraphTab].chartData.startOffsets = startOffsets;
  }

  //----------------------------------------------------------------------------------------------------
  //----------------------------------------------------------------------------------------------------

  //make the paths
  $: actPaths = createActipathArray(
    $graphs[$activeGraphTab].chartData,
    $graphs[$activeGraphTab].params.dayHeight
  );

  function createActipathArray(chartData, dayHeight) {
    if (chartData) {
      const days = $graphs[$activeGraphTab].chartData.data.time[0].length;
      const srcLength = $graphs[$activeGraphTab].chartData.data.time.length;
      const periodHrs = $graphs[$activeGraphTab].params.periodHrs;
      const doublePlot = $graphs[$activeGraphTab].params.doublePlot;
      const halfbarwidthScaled = chartData.xScale(binSize / 2);

      //the paths will be an array of arrays, length [sources][days]
      actPaths = Array.from({ length: srcLength }, (d) =>
        Array.from({ length: days }, () => "")
      );

      //for each source
      for (let srcIndex = 0; srcIndex < srcLength; srcIndex++) {
        //for each day
        for (let d = 0; d < days; d++) {
          const ydayoffset = d * (dayHeight + betweenHeight);

          // Set up the starting positions
          const moveToStart = `M0,${
            d * (dayHeight + betweenHeight) + dayHeight
          }`;
          actPaths[srcIndex][d] = actPaths[srcIndex][d] + moveToStart + " ";

          const yScale = chartData.yScales[srcIndex][d];

          // for each point, make the path proper (NB, the for loop is faster than alternatives https://hackernoon.com/performance-tests-on-common-javascript-array-methods)
          for (let i = 0; i < chartData.data.time[srcIndex][d].length; i++) {
            const x = chartData.data.time[srcIndex][d][i] - d * periodHrs;
            const y = chartData.data.values[srcIndex][d][i];

            const yout = yScale(y) + ydayoffset;

            const xout = chartData.xScale(x);

            //make the path if the value is not null
            const theNextPathPart = `${xout - halfbarwidthScaled},${
              ydayoffset + dayHeight
            }  ${xout - halfbarwidthScaled},${yout} ${
              xout + halfbarwidthScaled
            },${yout} ${xout + halfbarwidthScaled},${ydayoffset + dayHeight}`;

            //add the path if it should be added
            if (
              xout != null &&
              xout != undefined &&
              !isNaN(xout) &&
              yout != null &&
              yout != undefined &&
              !isNaN(yout)
            ) {
              actPaths[srcIndex][d] =
                actPaths[srcIndex][d] + theNextPathPart + " ";
            }
          }

          //make the ending
          const moveToReturn = `${chartData.xScale(periodHrs * doublePlot)},${
            d * (dayHeight + betweenHeight) + dayHeight
          } 0,${d * (dayHeight + betweenHeight) + dayHeight}`;

          actPaths[srcIndex][d] = actPaths[srcIndex][d] + moveToReturn + " Z";
        }
      }
    }
    return actPaths;
  }

  //----------------------------------------------------------------------------------------------------

  function mouseToPoint(e) {
    if (
      e.offsetX < margin.left ||
      e.offsetX > margin.left + width ||
      e.offsetY < margin.top ||
      e.offsetY > margin.top + innerHeight
    ) {
      return null;
    }
    const periodHrs = $graphs[$activeGraphTab].params.periodHrs;
    const doublePlot = $graphs[$activeGraphTab].params.doublePlot;
    const clickedDay = Math.floor(
      (e.offsetY - margin.top) / (dayHeight + betweenHeight)
    );
    const clickedHrs =
      ((e.offsetX - margin.left) / innerWidth) * periodHrs * doublePlot;

    const clickedTime = clickedDay * periodHrs + clickedHrs;

    return clickedTime;
  }

  function reportTime(clickedTime) {
    if (clickedTime) {
      $statusData.push({
        display: getTimeAt(clickedTime),
      });
      $statusData = $statusData;
    }
  }

  function getTimeAt(clickedTime) {
    //get the day it's clicked on
    const day = Math.floor(
      clickedTime / $graphs[$activeGraphTab].params.periodHrs
    );
    //get the bin (the time, knowing what the binsize is)
    let bin = Math.round(
      (clickedTime - $graphs[$activeGraphTab].chartData.data.time[0][day][0]) /
        $graphs[$activeGraphTab].params.binSizeHrs
    );
    //deal with negative values from the rounding
    if (bin < 0) {
      bin = 0;
    }

    //start the output with the binned time
    let out = addTime(
      $graphs[$activeGraphTab].params.startTime,
      $graphs[$activeGraphTab].chartData.data.time[0][day][bin]
    );
    //now add in each of the data values
    for (
      let src = 0;
      src < $graphs[$activeGraphTab].chartData.data.time.length;
      src++
    ) {
      out +=
        "<br><a style='color:" +
        $graphs[$activeGraphTab].sourceData[src].col.hex +
        ";''>" +
        getFieldName(
          $graphs[$activeGraphTab].sourceData[src].tableID,
          $graphs[$activeGraphTab].sourceData[src].chartvalues.values.field
        ) +
        ": " +
        $graphs[$activeGraphTab].chartData.data.values[src][day][bin].toFixed(
          2
        ) +
        "</a>";
    }
    return out;
  }

  //TODO: make this snap to the closest time and insert values
  function showTime(e) {
    mousePos = { x: 10 + e.pageX, y: -10 + e.pageY };
    if (
      e.offsetX < margin.left ||
      e.offsetX > margin.left + innerWidth ||
      e.offsetY < margin.top ||
      e.offsetY > margin.top + innerHeight
    ) {
      mousedown = false;
    }

    var overlay = document.querySelector(".overlay");
    const clickedTime = mouseToPoint(e);
    overlay.innerHTML = getTimeAt(clickedTime);
  }
</script>

{#if $graphs[$activeGraphTab].graph === "actigram" && $graphs[$activeGraphTab].sourceData.length > 0}
  <div class="actigramGraph">
    <div
      class="overlay"
      style={mousedown
        ? "display:block; left:" + mousePos.x + "px; top:" + mousePos.y + "px;"
        : "display:none;"}
    ></div>

    <svg
      id="svgContainer"
      {width}
      height={totalHeight}
      on:mousedown={(e) => {
        e.preventDefault();
        mousedown = true;
        showTime(e);
      }}
      on:mousemove={(e) => {
        if (mousedown) {
          e.preventDefault();
          mouseToPoint(e);
          showTime(e);
        }
      }}
      on:mouseup={(e) => {
        e.preventDefault();
        mousedown = false;
        mouseToPoint(e);
      }}
      on:click={(e) => {
        e.preventDefault();
      }}
      on:dblclick={(e) => {
        e.preventDefault();
        const ct = mouseToPoint(e);
        reportTime(ct);
      }}
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        {#if actPaths.length > 0}
          {#each actPaths as src, srcIndex}
            {#each createSequenceArray(0, actPaths[srcIndex].length - 1) as d}
              <path
                d={actPaths[srcIndex][d]}
                fill={$graphs[$activeGraphTab].sourceData[srcIndex].col.hex}
                fill-opacity={$graphs[$activeGraphTab].sourceData[srcIndex].col
                  .alpha}
              />
              {#if $graphs[$activeGraphTab].params.showAxes}
                <Axis
                  {innerHeight}
                  yoffset={d * (dayHeight + betweenHeight)}
                  xoffset={15 * srcIndex}
                  width={width - margin.left - margin.right - 15}
                  scale={$graphs[$activeGraphTab].chartData.yScales[srcIndex][
                    d
                  ]}
                  position={srcIndex === 0 ? "left" : "right"}
                  nticks={dayHeight / 30 + 1}
                  colour={$graphs[$activeGraphTab].sourceData[srcIndex].col.hex}
                />
              {/if}
            {/each}
          {/each}
        {:else}
          <text x="50%" y="50%" text-anchor="middle" fill="red"> </text>
        {/if}

        <!-- axis stuff-->
        <Axis
          {innerHeight}
          yoffset="0"
          scale={$graphs[$activeGraphTab].chartData.xScale}
          position="top"
          nticks={$graphs[$activeGraphTab].params.periodHrs}
        />
      </g>
    </svg>
  </div>
{/if}

<style>
  .overlay {
    position: absolute;
    cursor: pointer;
    z-index: 10001;
    background: var(--hover-color);
    padding: 5px;
    border-radius: 10px;
    box-shadow: 0px 0px 15px -5px var(--font-color);
  }
</style>
