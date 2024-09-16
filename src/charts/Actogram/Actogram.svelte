<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab, statusData } from "../../store";
  import { scaleLinear } from "d3-scale";
  import Axis from "../Axis.svelte";
  import {
    getstartTimeOffset,
    getISODate,
    addTime,
    calculateTimeDifference,
  } from "../../utils/time/TimeUtils";
  import { createSequenceArray, min, max } from "../../utils/MathsStats";
  import {
    getDataFromSource,
    getFieldName,
    averageBinnedValues,
    getDiffs,
    calculateMedian,
    calculateMAD,
    linearRegression,
  } from "../../data/handleData";
  import { defaultChartData } from "../Actogram/Actogram_defaults.svelte";
  import About from "../../components/About.svelte";

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

  $: totalHeight = calcTotalHeight(
    margin,
    $graphs[$activeGraphTab]?.params.dayHeight,
    $graphs[$activeGraphTab]?.params.betweenHeight
  );
  $: binSize = $graphs[$activeGraphTab]?.params.binSizeHrs;
  $: width = $graphs[$activeGraphTab]?.params.width;
  $: dayHeight = $graphs[$activeGraphTab]?.params.dayHeight;
  $: betweenHeight = $graphs[$activeGraphTab]?.params.betweenHeight;
  $: innerHeight = totalHeight - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;

  function calcTotalHeight(margin, dayHeight, betweenHeight) {
    if ($graphs[$activeGraphTab]?.graph === "Actogram") {
      let days =
        $graphs[$activeGraphTab].chartData.data[0]?.day[
          $graphs[$activeGraphTab].chartData.data[0]?.day.length - 1
        ];

      makePlotData(
        $graphs[$activeGraphTab].sourceData,
        $graphs[$activeGraphTab].params.binSizeHrs,
        $graphs[$activeGraphTab].params.periodHrs,
        $graphs[$activeGraphTab].params.startTime
      );

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
    if ($graphs[$activeGraphTab]?.graph === "Actogram") {
      let xVals, yVals;

      let chartData = defaultChartData;

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
      $graphs[activeGraphT].graph === "Actogram" &&
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
    if (chartData && $graphs[$activeGraphTab].graph === "Actogram") {
      const dayLength = Math.ceil(periodHrs / binSizeHrs);

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
            min($graphs[$activeGraphTab].chartData.data[srcIndex].values),
            max($graphs[$activeGraphTab].chartData.data[srcIndex].values),
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

  //-- LInear regression for the onsets
  function doLinearRegressionOnsets(onsetsIN, excludedOnsets, bestMatchTime) {
    //set up for the linear regression
    let y = [];
    let x = [];
    for (let i = onsetsIN.filterStart - 1; i < onsetsIN.filterEnd; i++) {
      if (!excludedOnsets.includes(i)) {
        x.push(i * $graphs[$activeGraphTab]?.params.periodHrs);
        y.push(
          bestMatchTime.slice(i, i + 1) -
            i * $graphs[$activeGraphTab]?.params.periodHrs
        );
      }
    }
    return linearRegression(x, y);
  }

  //----------------------------------------------------------------------------------------------------
  //Code to find the onsets and offsets
  // This is based on the approach of Clocklab, per https://www.harvardapparatus.com/media/manuals/Product%20Manuals/ACT-500%20ClockLab%20Analysis%20Manual.pdf
  //TODO_high: move this to the Onset.svelte file? or make for each onset
  function findOnOffsets(sourceIndex) {
    //reset the chart data
    $graphs[$activeGraphTab].chartData.onsets = [];

    //get the data
    const times = $graphs[$activeGraphTab].chartData.data[sourceIndex].time;
    const values = $graphs[$activeGraphTab].chartData.data[sourceIndex].values;
    const binSizeHrs = $graphs[$activeGraphTab].params.binSizeHrs;
    const periodHrs = $graphs[$activeGraphTab].params.periodHrs;
    const periodStep = Math.ceil(periodHrs / binSizeHrs);

    const dbl = $graphs[$activeGraphTab].params.doublePlot;

    //loop over the onsets and calculate
    for (
      let o = 0;
      o < $graphs[$activeGraphTab].sourceData[sourceIndex].onsets.length;
      o++
    ) {
      //Set up the parameters
      const centile =
        $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
          .centileThresh;
      const Nhrs = $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].N;
      const Mhrs = $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].M;

      const template = createTemplate(
        Nhrs,
        Mhrs,
        binSizeHrs,
        $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].type
      );

      //find the centile
      const centileValue = findCentileValue(values, centile);

      //conver the data to -1s and 1s
      const aboveBelow = values.map((value) =>
        value <= centileValue || isNaN(value) ? -1 : 1
      );

      //get the best matching index for each day
      let bestMatchIndex = [];
      let bestMatchTime = [];

      //TODO _high: consider not splitting by days - running correlation over the entire dataset and the choosing points which are above a threshold (95centile) [and not within C hrs of another point, in case there will be multiple values?].
      //ALSO need to add in acrophase

      for (let d = 0; d < aboveBelow.length / periodStep; d++) {
        bestMatchIndex[d] =
          findBestMatchIndex(
            aboveBelow
              .slice(d * periodStep, (d + 1) * periodStep)
              .concat(Array.from({ length: 5 * Mhrs }, () => -1)),
            template
          ) + Math.round(Nhrs / binSizeHrs); // add the Nhrs step to be the start of the jump

        bestMatchTime[d] =
          $graphs[$activeGraphTab].chartData.data[sourceIndex].time[
            bestMatchIndex[d] + d * periodStep
          ];
      }

      //remove points beyond Median Absolute Deviations
      //First calculate the linear fit
      const linearFitb4MAD = doLinearRegressionOnsets(
        $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o],
        [], //None excluded (keep them all)
        bestMatchTime
      );

      //Now take this into account when calculating MAD
      //TODO_med: Account for breaks across periods (discrete jumps but same period)
      let excludedOnsets;
      if ($graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].MAD > 0) {
        const N = bestMatchTime.length;
        const bestMatchHrs = bestMatchTime.map(
          (value, index) =>
            value -
            $graphs[$activeGraphTab]?.params.periodHrs * index -
            (linearFitb4MAD.intercept + linearFitb4MAD.slope * index)
        );
        console.log(
          bestMatchTime.map(
            (value, index) =>
              value - $graphs[$activeGraphTab]?.params.periodHrs * index
          )
        );
        const medianBMT = calculateMedian(bestMatchHrs);
        const madBMT = calculateMAD(
          bestMatchHrs,
          calculateMedian(bestMatchHrs)
        );

        excludedOnsets = bestMatchHrs
          .map((value, index) => ({ value, index }))
          .filter(
            ({ value }) =>
              Math.abs(value - medianBMT) >
              $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].MAD *
                madBMT
          )
          .map(({ index }) => index);
      } else {
        excludedOnsets = [];
      }

      //calculate the points to plot
      let xs = [];
      let ys = [];

      for (let d = 0; d < bestMatchTime.length; d++) {
        xs[d] =
          xScale(
            bestMatchTime[d] - d * $graphs[$activeGraphTab].params.periodHrs
          ) + margin.left;
        ys[d] = d * (dayHeight + betweenHeight) + dayHeight + margin.top;
      }

      const median = calculateMedian(xs);

      const linearFit = doLinearRegressionOnsets(
        $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o],
        excludedOnsets,
        bestMatchTime
      );
      console.log(linearFit);
      $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].lmFit =
        linearFit;

      //update for drawing
      $graphs[$activeGraphTab].chartData.onsets = [
        ...$graphs[$activeGraphTab].chartData.onsets,
        {
          onsetTimes: bestMatchTime,
          excludeOnsets: excludedOnsets,
          //TODO _med: redo the logic for these values - the lines don't look good at some periodHrs - when the data period is high or low (steep slope). Suggestion: pick a group of points to put the line through, rather than choosing the median value (?)
          //TODO _med: need to truncate the line also - as it can go off the chart.
          //TODO _med: update logic so mad takes the line into account!
          MAD: $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].MAD,
          show: $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
            .showOnsets,
          col: $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].col,
          alpha:
            $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].alpha,
          filterStart:
            $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
              .filterStart,
          filterEnd:
            $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
              .filterEnd,
          median: median,
          lmFit: linearFit,
          showLine:
            $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].showLine,
        },
      ];
    }
  }

  //create the template
  function createTemplate(Nhrs, Mhrs, binSize, onoff) {
    const N = Math.round(Nhrs / binSize);
    const M = Math.round(Mhrs / binSize);
    let resultArray;

    //TODO_high: Something wrong with the offset... onset seems to work fine, but offset is strange. SEEMS TO BE WHEN THE OFFSET/ONSET is at 24h.
    if (onoff === "onset") {
      // Create an array with N -1s followed by M 1s
      resultArray = Array.from({ length: N }, () => -1).concat(
        Array.from({ length: M }, () => 1)
      );
    } else {
      resultArray = Array.from({ length: N }, () => 1).concat(
        Array.from({ length: M }, () => -1)
      );
    }

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

{#if $graphs[$activeGraphTab]?.graph === "Actogram" && $graphs[$activeGraphTab].sourceData.length > 0}
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
      {#each $graphs[$activeGraphTab].chartData.onsets as onset, osIndex}
        {#if onset.show}
          {#each onset.onsetTimes as onsetT, d}
            {#if d >= onset.filterStart - 1 && d <= onset.filterEnd - 1}
              <!-- only show those in the filter range-->
              {#if onset.excludeOnsets.includes(d)}
                <!-- show excluded without fill-->
                <circle
                  cx={xScale(
                    onsetT - d * $graphs[$activeGraphTab].params.periodHrs
                  )}
                  cy={d * (dayHeight + betweenHeight) + dayHeight}
                  r="4"
                  fill={onset.col.hex}
                  fill-opacity="0"
                  stroke-width="0.5"
                  stroke="black"
                />
              {:else}
                <!-- show included with fill -->
                <circle
                  cx={xScale(
                    onsetT - d * $graphs[$activeGraphTab].params.periodHrs
                  )}
                  cy={d * (dayHeight + betweenHeight) + dayHeight}
                  r="4"
                  fill={onset.col.hex}
                  fill-opacity={onset.col.alpha}
                  stroke-width="0.5"
                  stroke="black"
                />
              {/if}
            {/if}

            {#if onset.showLine}
              <line
                x1={xScale(onset.lmFit.intercept)}
                y1={0 * (dayHeight + betweenHeight) + dayHeight}
                x2={xScale(
                  onset.lmFit.intercept +
                    (onset.onsetTimes.length - 1) *
                      onset.lmFit.slope *
                      $graphs[$activeGraphTab].params.periodHrs
                )}
                y2={(onset.onsetTimes.length - 1) *
                  (dayHeight + betweenHeight) +
                  dayHeight}
                stroke={onset.col.hex}
              />
            {/if}
          {/each}
        {/if}
      {/each}

      <!-- ANNOTATIONS-->
      {#each $graphs[$activeGraphTab].chartData?.annotations as an, ai}
        <rect
          x={xScale(
            calculateTimeDifference(
              $graphs[$activeGraphTab].params.startTime,
              an.startTime,
              "yyyy-LL-dd'T'T"
            ) % $graphs[$activeGraphTab].params.periodHrs
          )}
          y={Math.floor(
            calculateTimeDifference(
              $graphs[$activeGraphTab].params.startTime,
              an.startTime,
              "yyyy-LL-dd'T'T"
            ) / $graphs[$activeGraphTab].params.periodHrs
          ) *
            (dayHeight + betweenHeight)}
          height={dayHeight}
          width={xScale(an.lengthHrs)}
          fill={an.col.hex}
          fill-opacity={an.col.alpha}
        />
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
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }
</style>
