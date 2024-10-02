<script>
  // @ts-nocheck
  import { data, graphs, activeGraphTab, statusData } from "../../store";
  import { DateTime } from "luxon";
  import { scaleLinear } from "d3-scale";
  import Axis from "../Axis.svelte";
  import {
    getstartTimeOffset,
    getISODate,
    addTime,
    calculateTimeDifference,
    formatDate,
  } from "../../utils/time/TimeUtils";
  import { createSequenceArray, min, max } from "../../utils/MathsStats";
  import {
    getDataFromSource,
    getRawData,
    getFirstTime,
    getFieldName,
    averageBinnedValues,
    getDiffs,
    calculateMedian,
    calculateMAD,
    linearRegression,
    removeNaNs,
    getFieldTypeFromGraph,
    addManualMarker,
    removeMarker,
  } from "../../data/handleData";
  import { defaultChartData } from "../Actogram/Actogram_defaults.svelte";
  import About from "../../components/About.svelte";
  import tippy from "tippy.js"; //https://atomiks.github.io/tippyjs/v6/getting-started/

  function tippytip(node, params) {
    let tip = tippy(node, params);
    return {
      update: (newParams) => {
        tip.setProps(newParams);
      },
      destroy: () => {
        tip.destroy();
      },
    };
  }

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
  //TODO_med: this runs twice each time a change is made - need to stop it
  function makePlotData(sourceData, binSizeHrs, periodHrs, startTime) {
    if ($graphs[$activeGraphTab]?.graph === "Actogram") {
      //start with the default data
      let chartData = structuredClone(defaultChartData);
      console.log("DEFAULT:", chartData);
      let xVals, yVals;

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

        //Remove NaNs from all
        [xVals, yVals] = removeNaNs([xVals, yVals]);

        //if the type is time then calculate start time
        if (
          getFieldTypeFromGraph(
            $graphs[$activeGraphTab].id,
            sourceIndex,
            "time"
          ) === "time"
        ) {
          const firstDataTime = DateTime.fromISO(
            getFirstTime(sourceIndex, plotData.chartvalues.time)
          );

          //initialise the start time if it's not set
          if (startTime === "") {
            startTime = DateTime.fromISO(firstDataTime)
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
              .toISO()
              .slice(0, 16);
            $graphs[$activeGraphTab].params.startTime =
              DateTime.fromISO(startTime); // make sure it's always a DateTime object
          }
          //get the offset from the time
          const diffTime = firstDataTime.diff(
            DateTime.fromISO(startTime),
            "hours"
          ).hours;
          console.log("offset = ", diffTime);
          //record the offsets - where the data starts from wrt the start time
          chartData.startOffsets[sourceIndex] = Number(diffTime);
          //Add the offset
          xVals = xVals.map(
            (x) => Number(x) + chartData.startOffsets[sourceIndex]
          );
        } else {
          //otherwise make the start time 00 of today
          if (startTime === "") {
            startTime = DateTime.now()
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
              .toISO()
              .slice(0, 16);
            $graphs[$activeGraphTab].params.startTime =
              DateTime.fromISO(startTime);
          }
          //make the offset the first value
          //record the offsets - where the data starts from wrt the start time
          chartData.startOffsets[sourceIndex] = xVals[0];
          //Add the offset
          xVals = xVals.map(
            (x) => Number(x) + chartData.startOffsets[sourceIndex]
          );
        }

        //Make the binned data
        const binnedData = averageBinnedValues(
          xVals,
          yVals,
          binSizeHrs,
          xVals[0] //start binning at the start time, not 0
        );

        //set up the plot data for any new sources
        if (sourceIndex > 0) {
          chartData.data[sourceIndex] = {
            time: [],
            values: [],
            day: [],
            scaleLimits: [],
          };
        }
        //populate with the binned data
        chartData.data[sourceIndex].time = binnedData.time;
        chartData.data[sourceIndex].values = binnedData.values;

        //create array for the days and for thex ylimits (per day)
        const daysArray = binnedData.time.map((x) => {
          return Math.floor(x / periodHrs);
        });
        chartData.data[sourceIndex].day = daysArray;
        console.log(chartData);

        const dayValueMap = {};

        chartData.data[sourceIndex].day.forEach((day, index) => {
          if (!dayValueMap[day]) {
            dayValueMap[day] = [];
          }
          dayValueMap[day].push(chartData.data[sourceIndex].values[index]);
        });

        // create scaleLimits array
        const scaleLimits = Object.keys(dayValueMap).map((day) => {
          const values = dayValueMap[day];
          const min = Math.min(...values);
          const max = Math.max(...values);
          return { min: min, max: max };
        });
        chartData.data[sourceIndex].scaleLimits = scaleLimits;
      });

      //now set the data (and create the actipaths)
      $graphs[$activeGraphTab].chartData.data = chartData.data;

      //do the onsets
      for (let srcIndex = 0; srcIndex < sourceData.length; srcIndex++) {
        findOnOffsets(srcIndex);
      }
    }
  }

  //----------------------------------------------------------------------------------------------------
  //----------------------------------------------------------------------------------------------------

  //make the paths
  //TODO_med: This works when the startTime is midnight, but there is a bug when the time is anything else - the whole chart shifts, rather than the data flowing.
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
      console.log("MAKING ACTIPATHS");
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

      //the paths (and yScales) will be an array of arrays, length [sources][days]
      yScales = []; //needed for the Axis on each day
      //set up the actpath data
      actPaths = []; // for the paths, themselves

      //for each source
      for (let srcIndex = 0; srcIndex < srcLength; srcIndex++) {
        var tempactPathDatax = [];
        var tempactPathDatay = [];

        //get the global min/max for the scales
        const globalMin = min(
          $graphs[$activeGraphTab].chartData.data[srcIndex].values
        );
        const globalMax = max(
          $graphs[$activeGraphTab].chartData.data[srcIndex].values
        );

        // set up the start flag
        var startFlag = true;
        var thisDay = chartData.data[srcIndex].day[0];
        //go through each point
        for (let i = 0; i < chartData.data[srcIndex].day.length; i++) {
          //get the day, time and value
          const dayI = chartData.data[srcIndex].day[i];
          const timeI = chartData.data[srcIndex].time[i];
          const valueI = chartData.data[srcIndex].values[i];

          //if the day is different from the previous day | NB, the binning will provide sequential days, so we can assume they are in order (eg [4,4,4,5,5,5,6,6,6...])
          if (dayI !== thisDay || startFlag) {
            startFlag = false; //lower the start flag
            //initialise the temppathdata
            tempactPathDatax[dayI] = [timeI];
            tempactPathDatay[dayI] = [valueI];
          } else {
            // if it's the same day
            //update the actpath data
            tempactPathDatax[dayI].push(timeI);
            tempactPathDatay[dayI].push(valueI);
          }
          //update thisDay
          thisDay = dayI;
        } // for each point (i)

        //Now make the actigraphs
        yScales[srcIndex] = [];
        actPaths[srcIndex] = [];
        for (
          let d = chartData.data[srcIndex].day[0];
          d < tempactPathDatax.length;
          d++
        ) {
          //Make the y-scales
          if ($graphs[$activeGraphTab].params.scaleAxes === "byPlot") {
            //If we need a different y-scale for each row
            var tempMin =
              chartData.data[srcIndex].scaleLimits[
                d - chartData.data[srcIndex].day[0]
              ].min;
            var tempMax =
              chartData.data[srcIndex].scaleLimits[
                d - chartData.data[srcIndex].day[0]
              ].max;
            for (
              let dp = d;
              dp <
              min([
                d + $graphs[$activeGraphTab].params.doublePlot,
                chartData.data[srcIndex].scaleLimits.length,
              ]);
              dp++
            ) {
              tempMin = min([
                tempMin,
                chartData.data[srcIndex].scaleLimits[dp].min,
              ]);
              tempMax = max([
                tempMax,
                chartData.data[srcIndex].scaleLimits[dp].max,
              ]);
            }

            yScales[srcIndex][d] = scaleLinear()
              .domain([tempMin, tempMax])
              .range([dayHeight, 0]);
          } else {
            //if it's just the global y-scale
            yScales[srcIndex][d] = scaleLinear()
              .domain([globalMin, globalMax])
              .range([dayHeight, 0]);
          }

          //get the y-offset and start the path
          const ydayoffset = d * (dayHeight + betweenHeight);
          actPaths[srcIndex][d] = `M0,${
            d * (dayHeight + betweenHeight) + dayHeight
          }`;
          //make sure to double plot
          for (
            let dp = d;
            dp <
            min([
              d + $graphs[$activeGraphTab].params.doublePlot,
              tempactPathDatax.length,
            ]);
            dp++
          ) {
            //make the path from each point
            for (let i = 0; i < tempactPathDatax[dp].length; i++) {
              const x = xScale(tempactPathDatax[dp][i] - d * periodHrs);
              const y =
                ydayoffset + yScales[srcIndex][d](tempactPathDatay[dp][i]);

              if (
                x != null &&
                x != undefined &&
                !isNaN(x) &&
                y != null &&
                y != undefined &&
                !isNaN(y)
              ) {
                actPaths[srcIndex][d] += ` ${x - halfbarwidthScaled},${
                  ydayoffset + dayHeight
                }  ${x - halfbarwidthScaled},${y} ${
                  x + halfbarwidthScaled
                },${y} ${x + halfbarwidthScaled},${ydayoffset + dayHeight} `;
              }
            }
          }
          //end the path
          actPaths[srcIndex][d] += `${xScale(periodHrs * doublePlot)},${
            d * (dayHeight + betweenHeight) + dayHeight
          } 0,${d * (dayHeight + betweenHeight) + dayHeight} Z`;
        }
      } //for each source

      return actPaths;
    } //check there is a graph
  } //FUNCTION

  //-- Linear regression for the onsets
  function doLinearRegressionOnsets(onsetsIN, excludedOnsets, bestMatchTime) {
    //set up for the linear regression
    let y = [];
    let x = [];
    for (let i = onsetsIN.filterStart - 1; i < onsetsIN.filterEnd; i++) {
      const bmot = bestMatchTime[i];

      if (!excludedOnsets.includes(i)) {
        x.push(
          Math.floor(
            bestMatchTime[i] / $graphs[$activeGraphTab]?.params.periodHrs
          ) * $graphs[$activeGraphTab]?.params.periodHrs
        );

        y.push(
          (bestMatchTime[i] - i * $graphs[$activeGraphTab]?.params.periodHrs) %
            $graphs[$activeGraphTab]?.params.periodHrs
        );
      }
    }

    //Remove any NaNs
    [x, y] = removeNaNs([x, y]);

    console.log("x", x, "y", y);
    //Only do the regression if there are data
    if (x.length) {
      return linearRegression(x, y);
    } else {
      return { slope: NaN, intercept: NaN, rSquared: NaN, rmse: NaN };
    }
  }

  //----------------------------------------------------------------------------------------------------
  //Code to find the onsets and offsets
  // This is based on the approach of Clocklab, per https://www.harvardapparatus.com/media/manuals/Product%20Manuals/ACT-500%20ClockLab%20Analysis%20Manual.pdf
  function findOnOffsets(sourceIndex) {
    //reset the chart data if the first time
    console.log("sourceIndex: ", sourceIndex);
    console.log(
      "onsets: ",
      $graphs[$activeGraphTab].chartData?.onsets[sourceIndex]
    );
    if (!$graphs[$activeGraphTab].chartData?.onsets[sourceIndex]) {
      console.log("clearing it");
      $graphs[$activeGraphTab].chartData.onsets[sourceIndex] = [];
    }

    //Do each onset
    for (
      let o = 0;
      o < $graphs[$activeGraphTab].sourceData[sourceIndex].onsets.length;
      o++
    ) {
      //Deal with the manual onsets
      if (
        $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].type ==
        "manual"
      ) {
        console.log($graphs[$activeGraphTab].chartData.onsets[sourceIndex]);
        console.log(
          $graphs[$activeGraphTab].chartData.onsets[sourceIndex].length
        );
        //make placeholder data if there is none
        if (
          $graphs[$activeGraphTab].chartData.onsets[sourceIndex].length == 0
        ) {
          console.log("making dummy data");
          $graphs[$activeGraphTab].chartData.onsets[sourceIndex][o] = {
            onsetTimes: [],
            col: $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].col,
            alpha:
              $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].alpha,
            filterStart: NaN,
            filterEnd: NaN,
            lmFit: {
              slope: NaN,
              intercept: NaN,
              rSquared: NaN,
              rmse: NaN,
            },
            showLine:
              $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
                .showLine,
          };
        } else {
          //do linear fit
          var x = $graphs[$activeGraphTab].chartData.onsets[sourceIndex][
            o
          ].onsetTimes.map((t) => {
            return (
              Math.floor(t / $graphs[$activeGraphTab]?.params.periodHrs) *
              $graphs[$activeGraphTab]?.params.periodHrs
            );
          });

          var y = $graphs[$activeGraphTab].chartData.onsets[sourceIndex][
            o
          ].onsetTimes.map((t, i) => {
            return (t - x[i]) % $graphs[$activeGraphTab]?.params.periodHrs;
          });

          //Remove any NaNs
          [x, y] = removeNaNs([x, y]);

          if (x.length) {
            var linearFit = linearRegression(x, y);
          } else {
            var linearFit = {
              slope: NaN,
              intercept: NaN,
              rSquared: NaN,
              rmse: NaN,
            };
          }
          console.log(
            $graphs[$activeGraphTab].chartData.onsets[sourceIndex][o].onsetTimes
          );
          console.log("x", x, "y", y);
          console.log(linearFit);

          $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].linearFit =
            linearFit;

          $graphs[$activeGraphTab].chartData.onsets[sourceIndex][o] = {
            onsetTimes:
              $graphs[$activeGraphTab].chartData.onsets[sourceIndex][o]
                .onsetTimes,
            excludeOnsets: [],
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
            lmFit: linearFit,
            showLine:
              $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
                .showLine,
          };
        }
        // else if the onsets are not manual
      } else {
        //Make a map for each day - we can assume that there is some data for each bin [for now]
        const dayGroups = new Map();
        const chartData = $graphs[$activeGraphTab].chartData.data[sourceIndex];

        //set up output
        let bestMatchIndex = [];
        let bestMatchTime = [];

        //get constants that are reused
        const Nhrs =
          $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].N;
        const Mhrs =
          $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].M;
        const binSizeHrs = $graphs[$activeGraphTab].params.binSizeHrs;
        const periodHrs = $graphs[$activeGraphTab].params.periodHrs;
        const periodStep = Math.ceil(periodHrs / binSizeHrs);

        //Make a template
        const template = createTemplate(
          Nhrs,
          Mhrs,
          binSizeHrs,
          $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].type
        );

        //Make a map for the calculations
        for (let i = 0; i < chartData.time.length; i++) {
          const day = Math.floor(
            chartData.time[i] / $graphs[$activeGraphTab].params.periodHrs
          );
          if (!dayGroups.has(day)) {
            dayGroups.set(day, { t: [], v: [] });
          }
          dayGroups.get(day).v.push(chartData.values[i]);
          dayGroups.get(day).t.push(chartData.time[i]);
        }

        //console.log(dayGroups);
        //Loop over each day and find the best match onoffset
        dayGroups.forEach((dayData, day) => {
          //convert the data to -1s and 1s
          const centileValue = findCentileValue(
            dayData.v,
            $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o]
              .centileThresh
          );

          const aboveBelow = dayData.v.map((value) =>
            value <= centileValue || isNaN(value) ? -1 : 1
          );
          bestMatchIndex[day] =
            findBestMatchIndex(
              aboveBelow.concat(Array.from({ length: 5 * Mhrs }, () => -1)),
              template
            ) + Math.round(Nhrs / binSizeHrs); // add the Nhrs step to be the start of the jump

          bestMatchTime[day] = dayData.t[bestMatchIndex[day]];
        });

        //remove the empty matches
        bestMatchTime = bestMatchTime.filter(
          (bm) => bm !== null && bm !== undefined
        );
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
        if (
          $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].MAD > 0
        ) {
          const N = bestMatchTime.length;
          const bestMatchHrs = bestMatchTime.map(
            (value, index) =>
              value -
              $graphs[$activeGraphTab]?.params.periodHrs * index -
              (linearFitb4MAD.intercept + linearFitb4MAD.slope * index)
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

        //redo the linear fit
        const linearFit = doLinearRegressionOnsets(
          $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o],
          excludedOnsets,
          bestMatchTime
        );
        $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].linearFit =
          linearFit;

        $graphs[$activeGraphTab].chartData.onsets[sourceIndex][o] = {
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
          lmFit: linearFit,
          showLine:
            $graphs[$activeGraphTab].sourceData[sourceIndex].onsets[o].showLine,
        };
      } //for each o
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

  function chartClicked(e) {
    if ($graphs[$activeGraphTab]?.semaphore?.text == "addingManualMarker") {
      addManualMarker(mouseToPoint(e));
    }
  }
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
      chartClicked(e);
    }}
    on:dblclick={(e) => {
      e.preventDefault();
      const ct = mouseToPoint(e);
      reportTime(ct);
    }}
  >
    <!-- ACTIPATHS -->
    <g transform={`translate(${margin.left},${margin.top})`}>
      {#if actPaths.length > 0}
        {#each $graphs[$activeGraphTab].sourceData as src, srcIndex}
          {#if $graphs[$activeGraphTab].sourceData[srcIndex].show}
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
          {/if}
        {/each}
      {:else}
        <text x="50%" y="50%" text-anchor="middle" fill="red"
          >Error: no data.
        </text>
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
      {#each $graphs[$activeGraphTab].chartData.onsets as src, srcIndex}
        {#each $graphs[$activeGraphTab].chartData?.onsets[srcIndex] as onset, osIndex}
          {#if onset.show}
            {#each onset.onsetTimes as onsetT, d}
              {#if d >= onset.filterStart - 1 && d <= onset.filterEnd - 1 && Number(onsetT)}
                <!-- only show those in the filter range-->
                <!-- show excluded without fill-->
                <circle
                  cx={xScale(
                    onsetT % $graphs[$activeGraphTab].params.periodHrs
                  )}
                  cy={Math.floor(
                    onsetT / $graphs[$activeGraphTab].params.periodHrs
                  ) *
                    (dayHeight + betweenHeight) +
                    dayHeight}
                  r="4"
                  fill={onset.col.hex}
                  fill-opacity={onset.excludeOnsets.includes(d) ? "0" : "1"}
                  stroke-width="0.5"
                  stroke="black"
                  on:dblclick={(e) => {
                    e.stopPropagation();
                    console.log(
                      "need to remove marker ",
                      d,
                      " of onset ",
                      osIndex,
                      " of src ",
                      srcIndex
                    );
                    //only remove it for the manual one

                    if (
                      $graphs[$activeGraphTab].sourceData[srcIndex].onsets[
                        osIndex
                      ].type === "manual"
                    ) {
                      removeMarker(srcIndex, osIndex, d);
                    }
                  }}
                />
              {/if}
            {/each}
            <!-- LINE -->
            {#if onset.showLine & (onset.onsetTimes.length > 1)}
              <line
                x1={xScale(onset.lmFit.intercept)}
                y1={dayHeight}
                x2={xScale(
                  onset.lmFit.intercept +
                    $graphs[$activeGraphTab].chartData?.data[0]?.scaleLimits
                      .length *
                      onset.lmFit.slope *
                      $graphs[$activeGraphTab].params.periodHrs
                )}
                y2={$graphs[$activeGraphTab].chartData?.data[0]?.scaleLimits
                  .length *
                  (dayHeight + betweenHeight) +
                  dayHeight}
                stroke={onset.col.hex}
              />
            {/if}
          {/if}
        {/each}
      {/each}

      <!-- ANNOTATIONS -->
      {#each $graphs[$activeGraphTab].extras?.annotations ?? [] as an, ai}
        <rect
          x={xScale(
            DateTime.fromISO(an.startTime)
              .diff(
                DateTime.fromISO($graphs[$activeGraphTab].params.startTime),
                "hours"
              )
              .hours.toFixed(4) % $graphs[$activeGraphTab].params.periodHrs
          )}
          y={Math.floor(
            DateTime.fromISO(an.startTime)
              .diff(
                DateTime.fromISO($graphs[$activeGraphTab].params.startTime),
                "hours"
              )
              .hours.toFixed(4) / $graphs[$activeGraphTab].params.periodHrs
          ) *
            (dayHeight + betweenHeight)}
          height={dayHeight}
          width={xScale(an.lengthHrs)}
          fill={an.col.hex}
          fill-opacity={an.col.alpha}
          use:tippytip={{
            content: an.name,
            theme: "Ancir",
          }}
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
