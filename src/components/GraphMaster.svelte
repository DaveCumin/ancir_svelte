<script context="module">
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { activeGraphTab, graphs, graphTabs } from "../store.js";
  import GraphTabs from "./GraphTabs.svelte";
  import ChartMaster from "../charts/ChartMaster.svelte";
  import { get } from "svelte/store";
  import { DateTime } from "luxon";

  //---------------------------------------------------------------------
  // ----- ADD NEW GRAPHS BELOW
  import Actigram from "../charts/Actigram/Actigram.svelte";
  import ActigramControls from "../charts/Actigram/Actigram_controls.svelte";

  import Raw from "../charts/Raw/Raw.svelte";
  import RawControls from "../charts/Raw/Raw_controls.svelte";

  export const graphMap = {
    actigram: {
      graph: Actigram,
      controls: ActigramControls,
      prototypechartvalues: { time: "time", values: "values" },
      prototypeother: { col: { hex: "#1B1D50", alpha: 0.5 } },
      othertypes: ["colour"],
      params: {
        startTime: DateTime.now()
          .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
          .toISO()
          .slice(0, 16),
        periodHrs: 24,
        binSizeHrs: 0.25,
        width: 600,
        dayHeight: 10,
        betweenHeight: 2,
        doublePlot: 2,
        scaleAxes: "byPlot",
        showAxes: true,
      },
    },
    raw: {
      graph: Raw,
      controls: RawControls,
      prototypechartvalues: { x: "any", y: "any" },
      prototypeother: {
        col: { hex: "#78322e", alpha: 0.5 },
        size: 5,
        strokeWidth: 6,
        strokeCol: { hex: "#000000", alpha: 0.9 },
      },
      othertypes: ["colour", "slider", "slider", "colour"],
      params: {
        width: 600,
        height: 200,
        yDomainMin: 0,
        yDomainMax: 20,
        xDomainMin: 0,
        xDomainMax: 20,
        yAxisLabel: "y-axis",
        xAxisLabel: "x-axis title here",
      },
    },
  };
  //---------------------------------------------------------------------

  function getRandomHexColour() {
    // Generate a random hex color
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }
  // MAKE A NEW CHART
  function putChartValues(keysIN, fieldsIN) {
    const chartValues = {};
    for (let i = 0; i < keysIN.length; i++) {
      chartValues[keysIN[i]] = {
        field: fieldsIN[i],
        processSteps: [],
        processedData: [],
      };
    }
    return chartValues;
  }

  //TODO: make this a popoup, like generate data: currently only works for actigram
  export function makeNewChart(type) {
    let newchart = {
      graph: type,
      id: getID(),
      sourceData: [
        {
          tableID: 0,
          name: "Data 0",
          chartvalues: putChartValues(
            Object.keys(graphMap[type].prototypechartvalues),
            ["time", "value0"]
          ),
          ...deepCopy(graphMap[type].prototypeother),
        },
        {
          tableID: 0,
          name: "Data 1",
          chartvalues: putChartValues(
            Object.keys(graphMap[type].prototypechartvalues),
            ["time", "value1"]
          ),
          ...deepCopy(graphMap[type].prototypeother),
        },
      ],
      params: { ...deepCopy(graphMap[type].params) },
    };

    //change the colours if there are any
    for (let p = 0; p < graphMap[type].othertypes.length; p++) {
      if (graphMap[type].othertypes[p] === "colour") {
        for (let s = 0; s < newchart.sourceData.length; s++) {
          newchart.sourceData[s][
            Object.keys(graphMap[type].prototypeother)[p]
          ].hex = getRandomHexColour();
        }
      }
    }

    get(graphs).push(newchart);

    get(graphTabs).push({ name: "Chart " + getID() });

    //make the updates
    graphTabs.update((currenttabs) => [...currenttabs]);
    activeGraphTab.update(() => get(graphTabs).length - 1);
  }

  //get the next highest id of graphs
  function getID() {
    if (get(graphs).length === 0) {
      return 0;
    }
    let ids = [];
    get(graphs).forEach((d) => ids.push(d.id));
    return Math.max(...ids) + 1;
  }

  function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
</script>

<Pane size={80}>
  <Splitpanes
    theme="modern-theme"
    style="height: 100%;"
    pushOtherPanes={false}
    dblClickSplitter={false}
  >
    <Pane>
      <GraphTabs />
      <div id="thePlot" style="margin-top: 10px; margin-left: 5px;">
        {#if $activeGraphTab < 0}
          <h3>Need to add a graph</h3>
        {:else if $graphs[$activeGraphTab].graph in graphMap}
          <svelte:component
            this={graphMap[$graphs[$activeGraphTab].graph].graph}
          />
        {:else}
          {$graphs[$activeGraphTab].graph}
        {/if}
      </div>
    </Pane>
    <Pane size={25}>
      {#if $activeGraphTab < 0}{:else if $graphs[$activeGraphTab].graph in graphMap}
        <div
          style="display: flex;
        min-width: 200px;"
        >
          <h1
            style="    padding: 6px 6px 0px 6px;
          font-weight: bold;
          font-size: 1.2em;
          text-decoration: underline;"
          >
            Controls
          </h1>
        </div>
        <svelte:component
          this={graphMap[$graphs[$activeGraphTab].graph].controls}
        />

        <ChartMaster />
      {:else}
        {JSON.stringify($graphs[$activeGraphTab].sourceData)}
      {/if}
    </Pane>
  </Splitpanes>
</Pane>
