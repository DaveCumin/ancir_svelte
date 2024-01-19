<script>
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
  console.log(version);
</script>

<svelte:head>
  <title>AnCiR v β.{version}</title>
</svelte:head>

<ContextMenu />
<GenerateSimulated />
<ImportData />

<div data-theme={$selectedTheme}>
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
