<script context="module">
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { activeGraphTab, graphs, graphTabs, contextMenu } from "../store.js";
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
        width: 600,
        dayHeight: 10,
        betweenHeight: 2,
      },
    },
    raw: {
      graph: Raw,
      controls: RawControls,
      prototypechartvalues: { x: "any", y: "any" },
      prototypeother: { col: { hex: "#78322e", alpha: 0.5 }, size: 5 },
      othertypes: ["colour", "slider"],
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

  // MAKE A NEW CHART
  //TODO: make this a popoup, like generate data
  export function makeNewChart(type) {
    let newchart = {
      graph: type,
      id: getID(),
      sourceData: [
        {
          tableID: 0,
          name: "Placeholder",
          chartvalues: {
            time: { field: "time", processSteps: [], processedData: [] },
            values: {
              field: "value0",
              processSteps: [],
              processedData: [],
            },
          },
          col: { hex: "#1B1D50", alpha: 0.7 },
        },
        {
          tableID: 0,
          name: "Placeholder",
          chartvalues: {
            time: { field: "time", processSteps: [], processedData: [] },
            values: {
              field: "value1",
              processSteps: [],
              processedData: [],
            },
          },
          col: { hex: "#A30F17", alpha: 0.7 },
        },
      ],
      params: { ...deepCopy(graphMap[type].params) },
    };

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

  //EXPORT AS SVG
  export function exportSVG() {
    const svgString = document
      .getElementById("thePlot")
      .querySelector("svg").outerHTML;
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");
    link.href = svgUrl;
    link.download = get(graphTabs)[get(activeGraphTab)].name + ".svg";
    document.body.appendChild(link);
    link.click();

    URL.revokeObjectURL(svgUrl);
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

      <div id="thePlot" style="margin-left: 5px;">
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
    <Pane size={30}>
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
          <button
            style="    float: right;
          margin: auto;
          margin-right: 10px; background: var(--bg-color"
            id="export"
            on:click={(e) => exportSVG()}>Export as SVG</button
          >
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
