<script>
  // @ts-nocheck
  // imports
  import { data, graphs, activeGraphTab } from "../../store";
  import { getDataFromSource } from "../../data/handleData";
  import { max } from "../../utils/MathsStats";
  import { scaleLinear, scaleBand } from "d3-scale";
  import Axis from "../Axis.svelte";

  //Do the plot
  const margin = { top: 20, bottom: 60, left: 60, right: 20 };

  $: width = $graphs[$activeGraphTab]?.params.width;
  $: height = $graphs[$activeGraphTab]?.params.height;
  $: innerHeight = height - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;

  let categories = [];
  let categoryValues = [];
  let categoryErrors = [];
  let xScale;
  let yScale;

  //This makes the data required for the plot; reactive to any changes
  $: {
    const categoryStats = {};
    let category;
    let thedata;

    if ($graphs[$activeGraphTab]?.graph === "Barplot") {
      $graphs[$activeGraphTab].sourceData.forEach((plotData, sourceIndex) => {
        console.log(sourceIndex);

        const theDataIndex = $data.findIndex((d) => d.id === plotData.tableID);

        //get the x data
        if (plotData.chartvalues.categories.field != "") {
          category = getDataFromSource(
            sourceIndex,
            plotData.chartvalues.categories
          );
        }

        //get the y data
        if (plotData.chartvalues.yax.field != "") {
          thedata = getDataFromSource(sourceIndex, plotData.chartvalues.yax);
        }

        //calculate the summarised data
        // Iterate through the data and category arrays
        thedata.forEach((value, index) => {
          const cat = category[index];
          if (!categoryStats[cat]) {
            categoryStats[cat] = { sum: 0, count: 0, values: [] };
          }
          categoryStats[cat].sum += value;
          categoryStats[cat].count += 1;
          categoryStats[cat].values.push(value);
        });

        // Calculate mean and standard deviation for each category
        categories = Object.keys(categoryStats);
        categoryValues = [];
        categoryErrors = [];
        let i = 0;
        for (const cat in categoryStats) {
          const stats = categoryStats[cat];
          const mean = stats.sum / stats.count;

          // Calculate standard deviation
          const variance =
            stats.values.reduce(
              (acc, val) => acc + Math.pow(val - mean, 2),
              0
            ) / stats.count;
          const stdDev = Math.sqrt(variance);

          categoryValues[i] = mean;
          categoryErrors[i] = stdDev;
          i = i + 1;
        }

        // Create the x (horizontal position) scale.
        xScale = scaleBand()
          .domain(categories)
          .range([0, innerWidth])
          .paddingInner($graphs[$activeGraphTab].params.barspace);

        // Create the y (vertical position) scale.
        yScale = scaleLinear()
          .domain([0, max(categoryValues)])
          .range([innerHeight, 0]);

        updateChartData(sourceIndex);
      });
    }
  }

  function updateChartData(sourceIndex) {
    console.log(categories);
    console.log(sourceIndex);
    console.log(
      $graphs[$activeGraphTab].chartData.data[sourceIndex].categories
    );
    $graphs[$activeGraphTab].chartData.data[sourceIndex].categories =
      categories;
    $graphs[$activeGraphTab].chartData.data[sourceIndex].categoryValues =
      categoryValues;
    $graphs[$activeGraphTab].chartData.data[sourceIndex].categoryErrors =
      categoryErrors;
  }
</script>

{#if $graphs[$activeGraphTab]?.graph === "Barplot" && $graphs[$activeGraphTab]?.sourceData.length > 0}
  <div class="barplot">
    <svg
      id="svgContainer"
      {width}
      {height}
      style={"transform-origin: top left; transform:scale(" +
        $graphs[$activeGraphTab].zoom +
        ");"}
    >
      <g class="bar" transform={`translate(${margin.left},${margin.right})`}>
        {#each categories as cat, i}
          <rect
            x={xScale(cat)}
            y={yScale(categoryValues[i])}
            height={yScale(0) - yScale(categoryValues[i])}
            width={xScale.bandwidth()}
            fill="red"
          />
        {/each}

        <!-- axis stuff-->
        <Axis {innerHeight} scale={xScale} position="bottom" />
        <Axis {innerHeight} scale={yScale} position="left" />

        <!-- TODO_low: move the label and margins for when there are high numbers on the axis (so the label and ticks don't overlap) -->
        <text
          style="text-anchor: middle;"
          transform={`translate(-30,${innerHeight / 2}) rotate(-90)     `}
          >Values</text
        >
        <text
          style="text-anchor: middle;"
          x={innerWidth / 2}
          y={innerHeight + 32}>Categories</text
        >
      </g>
    </svg>
  </div>
{/if}
