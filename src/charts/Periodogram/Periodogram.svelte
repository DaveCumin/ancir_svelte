<script>
  // @ts-nocheck
  import { graphs, activeGraphTab } from "../../store";
  import { scaleLinear } from "d3-scale";
  import Axis from "../Axis.svelte";
  import {
    getDataFromSource,
    averageBinnedValues,
  } from "../../data/handleData";
  import { pchisq, qchisq } from "../../utils/CDFs";
  import { mean } from "../../utils/MathsStats";
  import tippy from "tippy.js"; //https://atomiks.github.io/tippyjs/v6/getting-started/
  import "tippy.js/dist/tippy.css";

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

  let margin = { top: 20, bottom: 40, left: 80, right: 20 };

  $: width = $graphs[$activeGraphTab]?.params.width;
  $: height = $graphs[$activeGraphTab]?.params.height;
  $: innerHeight = height - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;

  let thePaths = [];
  let sigPaths = [];

  //----------------------------------------------------------------------------------------------------
  $: makePlotData(
    $graphs[$activeGraphTab]?.sourceData,
    $graphs[$activeGraphTab]?.params.binSizeHrs,
    $graphs[$activeGraphTab]?.params.minPeriod,
    $graphs[$activeGraphTab]?.params.maxPeriod,
    $graphs[$activeGraphTab]?.params.stepPeriod
  );

  function makePlotData(
    sourceData,
    binSizeHrs,
    minPeriod,
    maxPeriod,
    stepPeriod
  ) {
    if ($graphs[$activeGraphTab]?.graph === "Periodogram") {
      const alpha = 0.05;

      let xVals, yVals;

      let chartData = {
        data: { periods: [], power: [], sigThreshold: [], pvalue: [] },
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

        //set up the plot data
        chartData.data.periods[sourceIndex] = [];
        chartData.data.power[sourceIndex] = [];
        chartData.data.pvalue[sourceIndex] = [];
        chartData.data.sigThreshold[sourceIndex] = [];

        //calculate the chi-sq and put into the correct period
        let count = 0;
        const lengthPeriod = 1 + (maxPeriod - minPeriod) / stepPeriod;
        const correctedAlpha = Math.pow(1 - alpha, 1 / lengthPeriod);
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

          chartData.data.sigThreshold[sourceIndex][count] = qchisq(
            correctedAlpha,
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

      // set up the scales
      $graphs[$activeGraphTab].chartData.yScale = scaleLinear()
        .domain([yLims.ymin, yLims.ymax])
        .range([innerHeight, 0]);

      //MAKE THE PATHS
      sourceData.forEach((plotData, sourceIndex) => {
        for (let i = 0; i < chartData.data.power[sourceIndex].length; i++) {
          if (i === 0) {
            thePaths[sourceIndex] = `M `;
            sigPaths[sourceIndex] = "M";
          }
          thePaths[sourceIndex] += `${$graphs[$activeGraphTab].chartData.xScale(
            chartData.data.periods[sourceIndex][i]
          )} ${$graphs[$activeGraphTab].chartData.yScale(
            chartData.data.power[sourceIndex][i]
          )} `;

          sigPaths[sourceIndex] += `${$graphs[$activeGraphTab].chartData.xScale(
            chartData.data.periods[sourceIndex][i]
          )} ${$graphs[$activeGraphTab].chartData.yScale(
            chartData.data.sigThreshold[sourceIndex][i]
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

{#if $graphs[$activeGraphTab]?.graph === "Periodogram" && $graphs[$activeGraphTab]?.sourceData.length > 0}
  <div class="periodogram">
    <svg
      id="svgContainer"
      {width}
      {height}
      style={"transform-origin: top left; transform:scale(" +
        $graphs[$activeGraphTab].zoom +
        ");"}
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        {#if $graphs[$activeGraphTab].chartData.data.periods.length > 0}
          {#each $graphs[$activeGraphTab].chartData.data.periods as src, srcIndex}
            {#each src as period, periodIndex}
              <circle
                use:tippytip={{
                  content:
                    period.toFixed(2) +
                    ", " +
                    $graphs[$activeGraphTab].chartData.data.power[srcIndex][
                      periodIndex
                    ].toFixed(2) +
                    " (" +
                    $graphs[$activeGraphTab].chartData.data.pvalue[srcIndex][
                      periodIndex
                    ].toFixed(2) +
                    ")",
                  theme: "Ancir",
                }}
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

            <path
              d={sigPaths[srcIndex]}
              fill="none"
              stroke="red"
              stroke-opacity={$graphs[$activeGraphTab].sourceData[srcIndex].col
                .alpha}
              stroke-width="1px"
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
          transform={`translate(-50,${innerHeight / 2}) rotate(-90)     `}
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
