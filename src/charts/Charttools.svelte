<script>
  // @ts-nocheck

  import { data, graphs, activeGraphTab } from "../store";
  import { getDataFromSource } from "../data/handleData";
  import Tooltip from "../utils/Tooltip/Tooltip.svelte";
  import { exportSVG } from "../utils/exportSVG.js";

  //Zoom on the SVG
  function Zoom(type = "in") {
    const svg = document.getElementById("svgContainer");
    const scale = parseFloat(
      svg.style.transform.slice(svg.style.transform.indexOf("scale") + 6)
    );

    var newScale = scale;
    if (type === "in") {
      newScale += 0.1;
    } else {
      newScale -= 0.1;
    }

    $graphs[$activeGraphTab].zoom = newScale;

    svg.style.transform = "scale(" + newScale + ")";
    svg.style.width = ""; //auto fill to contents - this takes care of the margin-left and margin-top offsets of the g element
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

    if ($graphs[$activeGraphTab]?.graph === "raw") {
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
        if (Math.min(...xValsToPlot[i]) < tempxmin) {
          tempxmin = Math.min(...xValsToPlot[i]);
        }
        if (Math.max(...xValsToPlot[i]) > tempxmax) {
          tempxmax = Math.max(...xValsToPlot[i]);
        }

        if (Math.min(...yValsToPlot[i]) < tempymin) {
          tempymin = Math.min(...yValsToPlot[i]);
        }
        if (Math.max(...yValsToPlot[i]) > tempymax) {
          tempymax = Math.max(...yValsToPlot[i]);
        }
      }
      $graphs[$activeGraphTab].params.xDomainMin = tempxmin;
      $graphs[$activeGraphTab].params.xDomainMax = tempxmax;
      $graphs[$activeGraphTab].params.yDomainMin = tempymin;
      $graphs[$activeGraphTab].params.yDomainMax = tempymax;

      console.log(tempxmin);
      console.log(tempxmax);
      console.log(tempymin);
      console.log(tempymax);
    }
  }
</script>

<div
  id="chartTools"
  style="margin-left: {$graphs[$activeGraphTab]?.graph === 'raw'
    ? `calc(100% - 13em)`
    : `calc(100% - 10em)`}"
>
  {#if $graphs[$activeGraphTab]?.graph === "raw"}
    <Tooltip tipcontent="Auto scale axes">
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="button" id="scaleRaw" on:click={(e) => scaleAxes()}>
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
    </Tooltip>
  {/if}
  <Tooltip tipcontent="Zoom in">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="button" id="Zoom in" on:click={(e) => Zoom("in")}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 20"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M304 192v32c0 6.6-5.4 12-12 12h-56v56c0 6.6-5.4 12-12 12h-32c-6.6 0-12-5.4-12-12v-56h-56c-6.6 0-12-5.4-12-12v-32c0-6.6 5.4-12 12-12h56v-56c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v56h56c6.6 0 12 5.4 12 12zm201 284.7L476.7 505c-9.4 9.4-24.6 9.4-33.9 0L343 405.3c-4.5-4.5-7-10.6-7-17V372c-35.3 27.6-79.7 44-128 44C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208c0 48.3-16.4 92.7-44 128h16.3c6.4 0 12.5 2.5 17 7l99.7 99.7c9.3 9.4 9.3 24.6 0 34zM344 208c0-75.2-60.8-136-136-136S72 132.8 72 208s60.8 136 136 136 136-60.8 136-136z"
          style="
    transform: scale(0.04); fill: var(--font-color);
"
        ></path>
      </svg>
    </div>
  </Tooltip>

  <Tooltip tipcontent="Zoom out">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="button" id="Zoom in" on:click={() => Zoom("out")}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 20"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M304 192v32c0 6.6-5.4 12-12 12H124c-6.6 0-12-5.4-12-12v-32c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12zm201 284.7L476.7 505c-9.4 9.4-24.6 9.4-33.9 0L343 405.3c-4.5-4.5-7-10.6-7-17V372c-35.3 27.6-79.7 44-128 44C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208c0 48.3-16.4 92.7-44 128h16.3c6.4 0 12.5 2.5 17 7l99.7 99.7c9.3 9.4 9.3 24.6 0 34zM344 208c0-75.2-60.8-136-136-136S72 132.8 72 208s60.8 136 136 136 136-60.8 136-136z"
          style="
  transform: scale(0.04); fill: var(--font-color);
"
        ></path>
      </svg>
    </div>
  </Tooltip>

  <Tooltip tipcontent="Save plot">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="button" id="export" on:click={() => exportSVG()}>💾</div>
  </Tooltip>
</div>

<style>
  #chartTools {
    margin-top: -10px;
    background-color: var(--hover-color);
    -webkit-backdrop-filter: blur(1px);
    backdrop-filter: blur(1px);
    opacity: 0.4;
    position: absolute;
    border-radius: 5px;
    display: flex;
  }
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
  #chartTools:hover {
    opacity: 1;
    background: var(--bg-color);
  }
</style>
