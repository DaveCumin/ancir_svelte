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
  import {
    getDataFromSource,
    getFieldName,
    averageBinnedValues,
    bestFitOnsets,
    getDiffs,
    calculateMedian,
  } from "../../data/handleData";

  let margin = { top: 50, bottom: 20, left: 80, right: 80 };

  //for highlighting and reporting
  let mousedown = false;
  let mousePos = { x: 0, y: 0 };

  //for drawing
  let actPaths = "";
  let yScales = [];
  let xScale = scaleLinear().domain([0, 100]).range([0, innerWidth]);

  $: updateMargins($graphs[$activeGraphTab]?.params.showAxes);
  function updateMargins(show) {
    if (!show) {
      margin = { top: 50, bottom: 20, left: 50, right: 50 };
    } else {
      margin = { top: 50, bottom: 20, left: 80, right: 80 };
    }
  }

  $: totalHeight = calcTotalHeight(margin, dayHeight, betweenHeight);
  $: binSize = $graphs[$activeGraphTab]?.params.binSizeHrs;
  $: width = $graphs[$activeGraphTab]?.params.width;
  $: dayHeight = $graphs[$activeGraphTab]?.params.dayHeight;
  $: betweenHeight = $graphs[$activeGraphTab]?.params.betweenHeight;
  $: innerHeight = totalHeight - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;

  function calcTotalHeight(margin, dayHeight, betweenHeight) {
    if ($graphs[$activeGraphTab]?.graph === "actigram") {
      let days;
      if ($graphs[$activeGraphTab].chartData.onsets?.length > 0) {
        days = $graphs[$activeGraphTab].chartData.onsets[0].onsetTimes.length;
      } else {
        makePlotData(
          $graphs[$activeGraphTab].sourceData,
          $graphs[$activeGraphTab].params.binSizeHrs,
          $graphs[$activeGraphTab].params.periodHrs,
          $graphs[$activeGraphTab].params.startTime
        );
        days = $graphs[$activeGraphTab].chartData.onsets[0]?.onsetTimes.length;
      }

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
    $graphs[$activeGraphTab]?.sourceData,
    $graphs[$activeGraphTab]?.params.binSizeHrs,
    $graphs[$activeGraphTab]?.params.periodHrs,
    $graphs[$activeGraphTab]?.params.startTime
  );

  function makePlotData(sourceData, binSizeHrs, periodHrs, startTime) {
    if ($graphs[$activeGraphTab]?.graph === "actigram") {
      let xVals, yVals;

      let chartData = {
        data: [{ time: [], values: [], day: [], scaleLimits: [] }],
        startOffsets: [],
        onsets: [],
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
        chartData.startOffsets = updateOffsets(startTime, $activeGraphTab);

        //set up the plot data
        if (sourceIndex > 0) {
          chartData.data[sourceIndex] = {
            time: [],
            values: [],
            day: [],
            scaleLimits: [],
          };
        }
        chartData.data[sourceIndex].time = binnedData.time;
        chartData.data[sourceIndex].values = binnedData.values;

        //create the days and set up the limits (per day) - done here to avoid another loop in the plotting
        let sameday = Math.floor(binnedData.time[0] / periodHrs);
        for (let i = 0; i < binnedData.time.length; i++) {
          const currentDay = Math.floor(binnedData.time[i] / periodHrs);

          chartData.data[sourceIndex].day[i] = currentDay;

          if (currentDay === sameday) {
            const value = binnedData.values[i];

            if (!chartData.data[sourceIndex].scaleLimits[currentDay]) {
              chartData.data[sourceIndex].scaleLimits[currentDay] = {
                min: value,
                max: value,
              };
            } else {
              chartData.data[sourceIndex].scaleLimits[currentDay].min =
                Math.min(
                  value,
                  chartData.data[sourceIndex].scaleLimits[currentDay].min
                );
              chartData.data[sourceIndex].scaleLimits[currentDay].max =
                Math.max(
                  value,
                  chartData.data[sourceIndex].scaleLimits[currentDay].max
                );
            }
          } else {
            sameday = currentDay;
            chartData.data[sourceIndex].scaleLimits[sameday] = {
              min: binnedData.values[i],
              max: binnedData.values[i],
            };
          }
        }
      });

      //now set the data
      $graphs[$activeGraphTab].chartData = chartData;

      //do the onsets
      for (let srcIndex = 0; srcIndex < sourceData.length; srcIndex++) {
        findOnOffsets(srcIndex);
      }
    }
  }

  function updateOffsets(startTime, activeGraphT) {
    let startOffsets = [];
    //TODO _high: Change the start time when new data is added; to be the 00:00 of the first day of the data
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

    return startOffsets;
  }

  //----------------------------------------------------------------------------------------------------
  //----------------------------------------------------------------------------------------------------

  //make the paths
  $: actPaths = createActipathArray(
    $graphs[$activeGraphTab]?.chartData,
    $graphs[$activeGraphTab]?.params.dayHeight,
    $graphs[$activeGraphTab]?.params.doublePlot,
    $graphs[$activeGraphTab]?.params.periodHrs,
    $graphs[$activeGraphTab]?.params.binSizeHrs
  );

  function createActipathArray(
    chartData,
    dayHeight,
    doublePlot,
    periodHrs,
    binSizeHrs
  ) {
    if (chartData && $graphs[$activeGraphTab].graph === "actigram") {
      const dayLength = periodHrs / binSizeHrs;
      const srcLength = $graphs[$activeGraphTab].chartData.data.length;

      xScale = scaleLinear()
        .domain([
          0,
          $graphs[$activeGraphTab].params.periodHrs *
            $graphs[$activeGraphTab].params.doublePlot,
        ])
        .range([0, innerWidth]);

      const halfbarwidthScaled = xScale(binSize / 2);

      //the paths will be an array of arrays, length [sources][days]
      actPaths = [];
      yScales = []; //needed for the Axis on each day

      //for each source
      for (let srcIndex = 0; srcIndex < srcLength; srcIndex++) {
        actPaths[srcIndex] = [];
        yScales[srcIndex] = [];
        const days =
          $graphs[$activeGraphTab].chartData.data[srcIndex].scaleLimits.length;

        //default scale is the whole data
        var yScale = scaleLinear()
          .domain([
            Math.min(
              ...$graphs[$activeGraphTab].chartData.data[srcIndex].values
            ),
            Math.max(
              ...$graphs[$activeGraphTab].chartData.data[srcIndex].values
            ),
          ])
          .range([dayHeight, 0]);

        //for each day
        for (let d = 0; d < days; d++) {
          actPaths[srcIndex][d] = "";
          const ydayoffset = d * (dayHeight + betweenHeight);

          //set up the yScale for each row, if ticked
          if ($graphs[$activeGraphTab].params.scaleAxes === "byPlot") {
            let tempMin =
              $graphs[$activeGraphTab].chartData.data[srcIndex].scaleLimits[d]
                .min;
            let tempMax =
              $graphs[$activeGraphTab].chartData.data[srcIndex].scaleLimits[d]
                .max;
            for (
              let t = d;
              t <
              Math.min(
                d + doublePlot,
                $graphs[$activeGraphTab].chartData.data[srcIndex].scaleLimits
                  .length
              );
              t++
            ) {
              if (
                $graphs[$activeGraphTab].chartData.data[srcIndex].scaleLimits[t]
                  .min < tempMin
              ) {
                tempMin =
                  $graphs[$activeGraphTab].chartData.data[srcIndex].scaleLimits[
                    t
                  ].min;
              }
              if (
                $graphs[$activeGraphTab].chartData.data[srcIndex].scaleLimits[t]
                  .max > tempMax
              ) {
                tempMax =
                  $graphs[$activeGraphTab].chartData.data[srcIndex].scaleLimits[
                    t
                  ].max;
              }
            }
            yScale = scaleLinear()
              .domain([tempMin, tempMax])
              .range([dayHeight, 0]);
          }
          yScales[srcIndex][d] = yScale;
          // Set up the starting positions
          const moveToStart = `M0,${
            d * (dayHeight + betweenHeight) + dayHeight
          }`;
          actPaths[srcIndex][d] = actPaths[srcIndex][d] + moveToStart + " ";

          // for each point, make the path proper (NB, the for loop is faster than alternatives https://hackernoon.com/performance-tests-on-common-javascript-array-methods)
          for (
            let i = d * dayLength;
            i <
            Math.min(
              chartData.data[srcIndex].time.length,
              (d + doublePlot) * dayLength
            );
            i++
          ) {
            const x = chartData.data[srcIndex].time[i] - d * periodHrs;
            const y = chartData.data[srcIndex].values[i];

            const yout = yScale(y) + ydayoffset;

            const xout = xScale(x);

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
          const moveToReturn = `${xScale(periodHrs * doublePlot)},${
            d * (dayHeight + betweenHeight) + dayHeight
          } 0,${d * (dayHeight + betweenHeight) + dayHeight}`;

          actPaths[srcIndex][d] = actPaths[srcIndex][d] + moveToReturn + " Z";
        }
      }

      return actPaths;
    }
  }

  //----------------------------------------------------------------------------------------------------
  //Code to find the onsets and offsets
  // This is based on the approach of Clocklab, per https://www.harvardapparatus.com/media/manuals/Product%20Manuals/ACT-500%20ClockLab%20Analysis%20Manual.pdf
  function findOnOffsets(sourceIndex) {
    //Set up the parameters
    const centile =
      $graphs[$activeGraphTab].sourceData[sourceIndex].centileThresh;
    const Nhrs = $graphs[$activeGraphTab].sourceData[sourceIndex].N;
    const Mhrs = $graphs[$activeGraphTab].sourceData[sourceIndex].M;
    const binSizeHrs = $graphs[$activeGraphTab].params.binSizeHrs;
    const template = createTemplate(Nhrs, Mhrs, binSizeHrs);

    //get the data
    const times = $graphs[$activeGraphTab].chartData.data[sourceIndex].time;
    const values = $graphs[$activeGraphTab].chartData.data[sourceIndex].values;

    //find the centile
    const centileValue = findCentileValue(values, centile);

    //conver the data to -1s and 1s
    const aboveBelow = values.map((value) =>
      value <= centileValue || isNaN(value) ? -1 : 1
    );

    //get the best matching index for each day
    const periodHrs = $graphs[$activeGraphTab].params.periodHrs;
    const periodStep = periodHrs / binSizeHrs;

    const dbl = $graphs[$activeGraphTab].params.doublePlot;
    let bestMatchIndex = [];
    let bestMatchTime = [];

    //TODO _high: consider not splitting by days - running correlation over the entire dataset and the choosing points which are above a threshold (95centile) [and not within C hrs of another point, in case there will be multiple values?].
    for (let d = 0; d < aboveBelow.length / periodStep; d++) {
      bestMatchIndex[d] =
        findBestMatchIndex(
          aboveBelow.slice(d * periodStep, (d + 1) * periodStep),
          template
        ) + Math.round(Nhrs / binSizeHrs); // add the Nhrs step to be the start of the jump

      bestMatchTime[d] =
        $graphs[$activeGraphTab].chartData.data[sourceIndex].time[
          bestMatchIndex[d] + d * periodStep
        ];
    }
    const estimate = bestFitOnsets(getDiffs(bestMatchTime));
    $graphs[$activeGraphTab].sourceData[sourceIndex].estimate =
      estimate.toFixed(3);

    /*     $statusData.push({
      display:
        "Estimated period for " +
        $graphs[$activeGraphTab].sourceData[sourceIndex].name +
        " = " +
        estimate.toFixed(3),
    });
    $statusData = $statusData;
 */
    //calculate the estimated period
    let xs = [];
    let ys = [];

    for (let d = 0; d < bestMatchTime.length; d++) {
      xs[d] =
        xScale(
          bestMatchTime[d] - d * $graphs[$activeGraphTab].params.periodHrs
        ) + margin.left;
      ys[d] = d * (dayHeight + betweenHeight) + dayHeight + margin.top;
    }
    //difference between the estimate and the period: this is to caluclate the slope of the line to draw (this value for each step in day)
    const D = $graphs[$activeGraphTab].params.periodHrs - estimate;

    const median = calculateMedian(xs);

    //which day is the median point?
    const estDay = xs.reduce(
      (prevIndex, curr, currIndex) =>
        Math.abs(curr - median) < Math.abs(xs[prevIndex] - median)
          ? currIndex
          : prevIndex,
      0
    );

    //update for drawing
    $graphs[$activeGraphTab].chartData.onsets[sourceIndex] = {
      onsetTimes: bestMatchTime,
      //TODO _med: redo the logic for these values - the lines don't look good at some periodHrs - when the data period is high or low (steep slope). Suggestion: pick a group of points to put the line through, rather than choosing the median value (?)
      //TODO _med: need to truncate the line also - as it can go off the chart.
      estimate: estimate,
      median: median,
      estDay: estDay,
      moveXDay: xScale(D),
      slope:
        xScale(D) /
        ($graphs[$activeGraphTab].params.dayHeight +
          $graphs[$activeGraphTab].params.betweenHeight),
    };
  }

  //create the template
  function createTemplate(Nhrs, Mhrs, binSize) {
    const N = Math.round(Nhrs / binSize);
    const M = Math.round(Mhrs / binSize);
    // Create an array with N -1s followed by M 1s
    const resultArray = Array.from({ length: N }, () => -1).concat(
      Array.from({ length: M }, () => 1)
    );

    return resultArray;
  }

  //get the centile
  function findCentileValue(data, centile) {
    const filteredData = data.filter((value) => !isNaN(value) && value !== 0);
    // Sort the filtered data in ascending order
    const sortedData = filteredData.slice().sort((a, b) => a - b);
    // Calculate the index for the percentile
    const indexPercentile = Math.ceil((centile / 100) * sortedData.length) - 1;
    // Retrieve the value at the calculated index
    const percentileValue = sortedData[indexPercentile];

    return percentileValue;
  }

  // find best matching to template
  function findBestMatchIndex(test, template) {
    let bestMatchIndex = -1;
    let bestCorrelation = -Infinity;

    for (let i = 0; i <= test.length - template.length; i++) {
      let correlation = 0;

      // Calculate the cross-correlation at the current index
      for (let j = 0; j < template.length; j++) {
        correlation += test[i + j] * template[j];
      }

      // Update best match if the correlation is higher
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestMatchIndex = i;
      }
    }

    return bestMatchIndex;
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
      (clickedTime - $graphs[$activeGraphTab].chartData.data[0].time[0]) /
        $graphs[$activeGraphTab].params.binSizeHrs
    );
    //deal with negative values from the rounding
    if (bin < 0) {
      bin = 0;
    }

    //start the output with the binned time
    let out = "";

    out = addTime(
      $graphs[$activeGraphTab].params.startTime,
      $graphs[$activeGraphTab].chartData.data[0].time[bin]
    );
    //now add in each of the data values
    for (
      let src = 0;
      src < $graphs[$activeGraphTab].chartData.data.length;
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
        $graphs[$activeGraphTab].chartData.data[src].values[bin].toFixed(2) +
        "</a>";
    }

    return out;
  }

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

    try {
      var overlay = document.querySelector(".overlay");
      const clickedTime = mouseToPoint(e);
      overlay.innerHTML = getTimeAt(clickedTime);
    } catch (error) {
      mousedown = false;
      //console.log(error);
    }
  }
</script>

{#if $graphs[$activeGraphTab]?.graph === "actigram" && $graphs[$activeGraphTab].sourceData.length > 0}
  <div
    class="overlay"
    style={mousedown
      ? "display:block; left:" + mousePos.x + "px; top:" + mousePos.y + "px;"
      : "display:none;"}
  ></div>

  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <svg
    id="svgContainer"
    margin-lr={margin.left + margin.right}
    style={"transform-origin: top left; transform:scale(" +
      $graphs[$activeGraphTab].zoom +
      ");"}
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
                scale={yScales[srcIndex][d]}
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
        scale={xScale}
        position="top"
        nticks={$graphs[$activeGraphTab].params.periodHrs}
      />

      <!-- ONSETS -->
      {#each $graphs[$activeGraphTab].chartData.onsets as onset, srcIndex}
        {#if $graphs[$activeGraphTab].sourceData[srcIndex].showOnsets}
          {#each $graphs[$activeGraphTab].chartData.onsets[srcIndex].onsetTimes as onsetT, d}
            <circle
              cx={xScale(
                onsetT - d * $graphs[$activeGraphTab].params.periodHrs
              )}
              cy={d * (dayHeight + betweenHeight) + dayHeight}
              r="2"
              fill={$graphs[$activeGraphTab].sourceData[srcIndex].col.hex}
              stroke-width="1"
              stroke="black"
            />
          {/each}
          <!--
        <line
          x1={onset.median + onset.moveXDay * onset.estDay}
          y1={margin.top + $graphs[$activeGraphTab].params.dayHeight}
          x2={onset.median -
            onset.moveXDay *
              ($graphs[$activeGraphTab].chartData.data[srcIndex]].time.length -
                onset.estDay)}
          y2={margin.top + innerHeight}
          style="stroke:rgb(255,0,0);stroke-width:2"
        ></line>
-->
        {/if}
      {/each}
    </g>
  </svg>
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
