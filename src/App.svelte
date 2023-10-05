<script>
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import DataTree from "./components/DataTree.svelte";
  import GraphMaster from "./components/GraphMaster.svelte";
  import TableMaster from "./components/TableMaster.svelte";
  import StatusMaster from "./components/StatusMaster.svelte";
  import MenuMaster from "./components/MenuMaster.svelte";
  import ProcessStep from "./components/ProcessStep.svelte";
</script>

<div class='w-full'>
<div class='px-4 py-4 font-semibold text-lg bg-cyan-600 text-white'>

  <MenuMaster />
</div>

  <div class='prose'>

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
          <Pane size={25} snapSize={10}>
            <h1 class='mx-2 mt-4 mb-6 4 px-2'>Data</h1>
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
  </div>
</div>
