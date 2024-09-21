<script>
  // @ts-nocheck

  import { Pane, Splitpanes } from "svelte-splitpanes";
  import GenerateSimulated from "./data/GenerateSimulated.svelte";
  import DataTree from "./components/DataTree.svelte";
  import GraphMaster from "./components/GraphMaster.svelte";
  import TableMaster from "./components/TableMaster.svelte";
  import StatusMaster from "./components/StatusMaster.svelte";
  import MenuMaster from "./components/MenuMaster.svelte";
  import ProcessStep from "./components/ProcessStep.svelte";
  import { selectedTheme } from "./store";
  import ContextMenu from "./utils/ContextMenu.svelte";
  import ImportData from "./data/importData.svelte";

  import { version } from "../package.json";
  import About from "./components/About.svelte";
  import CreateNewData from "./components/CreateNewData.svelte";
  import Styling from "./components/Styling.svelte";

  import { onMount } from "svelte";

  console.log("VERSION: " + version);

  //For the startup stuff --------------------------------
  import {
    graphMap,
    makeNewChart,
    getRandomHexColour,
    graphFilesLoaded,
  } from "./charts/AllCharts.js";
  import { addDataToGraph } from "./data/handleData";
  import { generateData } from "./data/simulate.js";
  import { DateTime } from "luxon";
  import { data, statusData, activeGraphTab, graphs } from "./store";

  onMount(async () => {
    await graphFilesLoaded;
    window.addEventListener("keydown", handleKeydown);

    window.onerror = function (msg, url, line) {
      console.log("THERE WAS AN ERROR. NEED TO HANDLE THIS BETTER. TODO_low");
      return true;
    };

    return () => {
      // Cleanup event listener when the component is destroyed
      window.removeEventListener("keydown", handleKeydown);
    };
  });
  function handleKeydown(e) {
    // only read/handle the key if the modal is not open
    if (e.ctrlKey && e.shiftKey && e.key === "G") {
      console.log($graphs);
    }
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      console.log($data);
    }
    if (e.ctrlKey && e.shiftKey && e.key === "S") {
      e.preventDefault();
      console.log("populate with example data and graphs");

      //----------------------------
      //Generate data
      const newDataEntry = generateData(
        28,
        15,
        DateTime.now()
          .set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          })
          .toJSDate(),
        [24, 28],
        [100, 150],
        $data.length
      );
      console.log(newDataEntry);
      // Add the newDataEntry to the data array using `data.update`
      $data = [...$data, newDataEntry];
      console.log($data);
      //----------------------------
      //make actogram
      makeNewChart("Actogram");
      addDataToGraph(
        0,
        { time: "time", values: "values" },
        {
          col: { hex: getRandomHexColour(), alpha: 0.5 },
          show: true,
          onsets: [
            {
              type: "onset",
              showOnsets: true,
              excludeOnsets: [],
              MAD: 2,
              filterStart: 1,
              filterEnd: 28,
              centileThresh: 80,
              M: 3,
              N: 3,
              lmFit: { slope: 0, intercept: 0, rSquared: 0 },
              col: { hex: getRandomHexColour(), alpha: 0.5 },
              showLine: true,
            },
          ],
        }
      );

      //create new graph
      makeNewChart("Raw");
      addDataToGraph(
        0,
        { x: "any", y: "any" },
        {
          col: { hex: getRandomHexColour(), alpha: 0.5 },
          size: 2,
          strokeWidth: 1,
          strokeCol: { hex: getRandomHexColour(), alpha: 0.9 },
        }
      );

      makeNewChart("Periodogram");
      addDataToGraph(
        0,
        { time: "any", values: "any" },
        {
          col: { hex: getRandomHexColour(), alpha: 0.5 },
        }
      );

      $activeGraphTab = 0;
    }
  }
  //------------------------------------------------
</script>

<svelte:head>
  <title>AnCiR v β.{version}</title>
</svelte:head>

<ContextMenu />
<GenerateSimulated />
<About />
<Styling />
<ImportData />
<CreateNewData />

<div>
  <div style="max-width: 100vw;">
    <MenuMaster />
  </div>

  <Splitpanes
    theme="modern-theme"
    horizontal
    style="height: calc(100vh - 3.4em); width: calc(100vw - 1em);"
    pushOtherPanes={false}
  >
    <Pane minSize={30}>
      <Splitpanes
        theme="modern-theme"
        style="height: 100%;"
        pushOtherPanes={false}
        dblClickSplitter={true}
      >
        <Pane size={18}>
          <DataTree />
        </Pane>
        <Pane>
          <Splitpanes
            theme="modern-theme"
            horizontal
            style="height: 100%;"
            pushOtherPanes={false}
            dblClickSplitter={false}
          >
            <GraphMaster />
            <TableMaster />
          </Splitpanes>
        </Pane>
      </Splitpanes>
    </Pane>
    <Pane size={10}>
      <StatusMaster />
    </Pane>
  </Splitpanes>

  <ProcessStep />
</div>
