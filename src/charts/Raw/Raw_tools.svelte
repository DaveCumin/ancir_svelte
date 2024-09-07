<script>
  import { data, graphs, activeGraphTab, addedNewChartData } from "../../store";
  import { getDataFromSource } from "../../data/handleData";
  import { max, min } from "../../utils/MathsStats";
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

  function scaleAxes() {
    //find the max and min values
    let tempxmin = Infinity;
    let tempxmax = -Infinity;
    let tempymin = Infinity;
    let tempymax = -Infinity;

    let xValsToPlot = [];
    let yValsToPlot = [];

    let xVals;
    let yVals;

    if ($graphs[$activeGraphTab]?.graph === "Raw") {
      $graphs[$activeGraphTab].sourceData.forEach((plotData, sourceIndex) => {
        const theDataIndex = $data.findIndex((d) => d.id === plotData.tableID);
        //get the x data
        if (plotData.chartvalues.x.field != "") {
          xVals = getDataFromSource(sourceIndex, plotData.chartvalues.x);
        }

        //get the y data
        if (plotData.chartvalues.y.field != "") {
          yVals = getDataFromSource(sourceIndex, plotData.chartvalues.y);
        }

        //put the data into the chart
        xValsToPlot.push(xVals);
        yValsToPlot.push(yVals);
      });

      for (let i = 0; i < xValsToPlot.length; i++) {
        const tempxVals = xValsToPlot[i].filter((d) => !isNaN(d));
        if (min(tempxVals) < tempxmin) {
          tempxmin = min(tempxVals);
        }
        if (max(tempxVals) > tempxmax) {
          tempxmax = max(tempxVals);
        }

        const tempyVals = yValsToPlot[i].filter((d) => !isNaN(d));
        if (min(tempyVals) < tempymin) {
          tempymin = min(tempyVals);
        }
        if (max(tempyVals) > tempymax) {
          tempymax = max(tempyVals);
        }
      }
      $graphs[$activeGraphTab].params.xDomainMin = tempxmin;
      $graphs[$activeGraphTab].params.xDomainMax = tempxmax;
      $graphs[$activeGraphTab].params.yDomainMin = tempymin;
      $graphs[$activeGraphTab].params.yDomainMax = tempymax;
    }
  }
  $: updateAxes($addedNewChartData);
  function updateAxes(sem) {
    if (sem) {
      scaleAxes();
      $addedNewChartData = false;
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="button"
  id="scaleRaw"
  on:click={(e) => scaleAxes()}
  use:tippytip={{
    content: "Auto scale axes",
    theme: "Ancir",
  }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
    stroke-width="1.5"
    stroke="currentColor"
  >
    <path
      d="M2 2L2 18L18 18"
      stroke="#292929"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
  </svg>
</div>

<style>
  .button {
    margin: 5px;
    border: none;
    border-radius: 20%;
    padding: 0.2em 0.5em;
    opacity: 1;
    cursor: pointer;
    width: 20px;
    height: 20px;
  }
  .button:hover {
    background: var(--hover-color);
  }
</style>
