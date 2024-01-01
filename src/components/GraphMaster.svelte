<script context="module">
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { activeGraphTab, graphs, graphTabs, contextMenu } from "../store.js";
  import GraphTabs from "./GraphTabs.svelte";
  import ChartMaster from "../charts/ChartMaster.svelte";
  import { get } from "svelte/store";

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
      prototypeother: { col: { hex: "#78322e", alpha: 0.5 } },
      othertypes: ["colour"],
      params: {
        startTime: "2023-10-02T11:35", //TODO: make this proper
        periodHrs: 24,
        width: 400,
        dayHeight: 100,
        betweenHeight: 5,
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

  export function makeNewChart(type) {
    let newchart = {
      graph: type,
      id: getID(),
      sourceData: [
        {
          tableID: 1,
          name: "Placeholder",
          chartvalues: {
            time: { field: "value12", processSteps: [], processedData: [] },
            values: {
              field: "value11",
              processSteps: [],
              processedData: [],
            },
          },
          col: { hex: "#19ff25", alpha: 0.7 },
        },
      ],
      params: { ...deepCopy(graphMap[type].params) },
    };

    get(graphs).push(newchart);
    console.log(get(graphs));

    get(graphTabs).push({ name: "Chart " + getID() });
    console.log(get(graphTabs));
    //activeGraphTab.set(get(graphTabs).length - 1);

    //TODO: make this a choice - probably a modal like the simulate data.
    //addDataToGraph(1);
  }

  //get the next highest id of graphs
  function getID() {
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
      {#if $graphs[$activeGraphTab].graph in graphMap}
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
          margin-right: 10px;"
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
