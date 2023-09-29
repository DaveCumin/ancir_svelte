<script>
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import DataTree from "./components/DataTree.svelte";
  import GraphMaster from "./components/GraphMaster.svelte";
  import TableMaster from "./components/TableMaster.svelte";
  import StatusMaster from "./components/StatusMaster.svelte";
  import MenuMaster from "./components/MenuMaster.svelte";
  import ProcessStep from "./components/ProcessStep.svelte";
</script>

<MenuMaster />
<Splitpanes
  horizontal
  style="height: calc(100vh - 10px - 3em); width: calc(100vw - 15px);"
  pushOtherPanes={false}
>
  <Pane minSize={30}>
    <Splitpanes
      style="height: 100%"
      pushOtherPanes={false}
      dblClickSplitter={false}
    >
      <Pane size={15}>
        <h1>Data</h1>
        <DataTree />
      </Pane>
      <Pane>
        <Splitpanes
          horizontal
          style="height: 100%"
          pushOtherPanes={false}
          dblClickSplitter={false}
        >
          <GraphMaster />
          <TableMaster />
        </Splitpanes>
      </Pane>
    </Splitpanes>
  </Pane>
  <Pane size={8}>
    <StatusMaster />
  </Pane>
</Splitpanes>

<ProcessStep />
