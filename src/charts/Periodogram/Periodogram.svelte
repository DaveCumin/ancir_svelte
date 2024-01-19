<script>
  // @ts-nocheck
  import { data, graphs, activeGraphTab, statusData } from "../../store";
  import { scaleLinear } from "d3-scale";
  import Axis from "../Axis.svelte";
  import {
    getDataFromSource,
    averageBinnedValues,
  } from "../../data/handleData";
  import { mean, pchisq } from "../../utils/MathsStats";
  import { tooltip } from "../../utils/Tooltip/tooltip";

  let margin = { top: 20, bottom: 40, left: 60, right: 20 };

  $: width = $graphs[$activeGraphTab].params.width;
  $: height = $graphs[$activeGraphTab].params.height;
  $: innerHeight = height - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;

  let thePaths = [];

  //----------------------------------------------------------------------------------------------------
  $: makePlotData(
    $graphs[$activeGraphTab].sourceData,
    $graphs[$activeGraphTab].params.binSizeHrs,
    $graphs[$activeGraphTab].params.minPeriod,
    $graphs[$activeGraphTab].params.maxPeriod,
    $graphs[$activeGraphTab].params.stepPeriod
  );

  function makePlotData(
    sourceData,
    binSizeHrs,
    minPeriod,
    maxPeriod,
    stepPeriod
  ) {
    if ($graphs[$activeGraphTab].graph === "periodogram") {
      let xVals, yVals;

      let chartData = {
        data: { periods: [], power: [], pvalue: [] },
        xScale: scaleLinear()
          .domain([minPeriod, maxPeriod])
          .range([0, innerWidth]),
        yScale: scaleLinear().domain([0, 100]).range([height, 0]),
      };

      let yLims = { ymin: Infinity, ymax: -Infinity };

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
        console.log(binnedData.values);
        //set up the plot data
        chartData.data.periods[sourceIndex] = [];
        chartData.data.power[sourceIndex] = [];
        chartData.data.pvalue[sourceIndex] = [];

        //calculate the chi-sq and put into the correct period
        let count = 0;
        for (let prd = minPeriod; prd < maxPeriod; prd += stepPeriod) {
          chartData.data.periods[sourceIndex][count] = prd;
          chartData.data.power[sourceIndex][count] = calculatePower(
            binnedData.values,
            binSizeHrs,
            prd
          );

          chartData.data.pvalue[sourceIndex][count] = pchisq(
            chartData.data.power[sourceIndex][count],
            Math.round(prd / binSizeHrs)
          );

          // make the y-limits
          if (chartData.data.power[sourceIndex][count] < yLims.ymin) {
            yLims.ymin = chartData.data.power[sourceIndex][count];
          }
          if (chartData.data.power[sourceIndex][count] > yLims.ymax) {
            yLims.ymax = chartData.data.power[sourceIndex][count];
          }

          count++;
        }
      });

      //now set the data
      $graphs[$activeGraphTab].chartData = chartData;
      console.log(chartData);
      // set up the scales
      $graphs[$activeGraphTab].chartData.yScale = scaleLinear()
        .domain([yLims.ymin, yLims.ymax])
        .range([innerHeight, 0]);

      //MAKE THE PATHS
      sourceData.forEach((plotData, sourceIndex) => {
        for (let i = 0; i < chartData.data.power[sourceIndex].length; i++) {
          if (i === 0) {
            thePaths[sourceIndex] = `M `;
          }
          thePaths[sourceIndex] += `${$graphs[$activeGraphTab].chartData.xScale(
            chartData.data.periods[sourceIndex][i]
          )} ${$graphs[$activeGraphTab].chartData.yScale(
            chartData.data.power[sourceIndex][i]
          )} `;
        }
      });
    }
  }
  //----------------------------------------------------------------------------------------------------
  // THE PERIODOGRAM STUFF
  //----------------------------------------------------------------------------------------------------

  function calculatePower(data, binSize, period) {
    const colNum = Math.round(period / binSize);
    const rowNum = Math.ceil(data.length / colNum);

    const avgP = Array.from({ length: colNum }, (_, colIndex) => {
      const colStart = colIndex;
      const colValues = Array.from(
        { length: rowNum },
        (_, rowIndex) => data[colStart + rowIndex * colNum]
      ).filter((value) => value !== undefined && !isNaN(value)); // only keep the true values

      //return the mean
      return mean(colValues);
    });

    const avgAll = mean(data);

    const numerator =
      avgP.reduce(
        (sum, avgPValue) => sum + Math.pow(avgPValue - avgAll, 2),
        0
      ) *
      (data.length * rowNum);
    const denominator = data.reduce(
      (sum, value) => sum + Math.pow(value - avgAll, 2),
      0
    );
    return numerator / denominator;
  }
</script>

{#if $graphs[$activeGraphTab].graph === "periodogram" && $graphs[$activeGraphTab].sourceData.length > 0}
  <div class="periodogram">
    <svg
      id="svgContainer"
      {width}
      {height}
      style="transform-origin: top left; transform:scale(1);"
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        {#if $graphs[$activeGraphTab].chartData.data.periods.length > 0}
          {#each $graphs[$activeGraphTab].chartData.data.periods as src, srcIndex}
            {#each src as period, periodIndex}
              <circle
                use:tooltip
                tipcontent={period.toFixed(2) +
                  ", " +
                  $graphs[$activeGraphTab].chartData.data.power[srcIndex][
                    periodIndex
                  ].toFixed(2) +
                  " (" +
                  $graphs[$activeGraphTab].chartData.data.pvalue[srcIndex][
                    periodIndex
                  ].toFixed(2) +
                  ")"}
                cx={$graphs[$activeGraphTab].chartData.xScale(period)}
                cy={$graphs[$activeGraphTab].chartData.yScale(
                  $graphs[$activeGraphTab].chartData.data.power[srcIndex][
                    periodIndex
                  ]
                )}
                r="3"
                fill={$graphs[$activeGraphTab].sourceData[srcIndex].col.hex}
                fill-opacity={$graphs[$activeGraphTab].sourceData[srcIndex].col
                  .alpha}
              />
            {/each}
            <path
              d={thePaths[srcIndex]}
              fill="none"
              stroke={$graphs[$activeGraphTab].sourceData[srcIndex].col.hex}
              stroke-opacity={$graphs[$activeGraphTab].sourceData[srcIndex].col
                .alpha}
              stroke-width="2px"
            />
          {/each}
        {:else}
          <text x="50%" y="50%" text-anchor="middle" fill="red">No Data </text>
        {/if}

        <!-- axis stuff-->
        <Axis
          {innerHeight}
          yoffset="0"
          scale={$graphs[$activeGraphTab].chartData.xScale}
          position="bottom"
        />
        <Axis
          {innerHeight}
          yoffset="0"
          scale={$graphs[$activeGraphTab].chartData.yScale}
          position="left"
        />
        <text
          style="text-anchor: middle;"
          transform={`translate(-40,${innerHeight / 2}) rotate(-90)     `}
          >Chi-sq</text
        >
        <text
          style="text-anchor: middle;"
          x={innerWidth / 2}
          y={innerHeight + 32}>Period</text
        >
      </g>
    </svg>
  </div>
{/if}
