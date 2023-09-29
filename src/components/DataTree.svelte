<script>
  import App from "../App.svelte";
  import { data, dataIDsforTables, activeTableTab } from "../store";
  import { addProcessStep, removeProcessStep } from "./ProcessStep.svelte";
  import changeActiveNav from "./TableTabs.svelte";

  //show the data in tables
  export function showDataTable(ID) {
    const tab = $dataIDsforTables.indexOf(ID);
    if (tab < 0) {
      //tab not there
      $dataIDsforTables.push(ID);
      $dataIDsforTables = $dataIDsforTables;
      $activeTableTab = $dataIDsforTables.length - 1;
    } else {
      //tab
      $activeTableTab = tab;
    }
  }
</script>

{#each $data as datum, i}
  <div class="data">
    <div
      class="dataheading"
      role="button"
      tabindex={i}
      on:click={() => showDataTable(datum.id)}
      on:keydown={(e) => console.log("here " + e)}
    >
      <h3>{datum.displayName}</h3>
    </div>
    {#each Object.keys(datum.data) as key}
      <div class="field">
        {datum.data[key].name}
        <button on:click={() => (datum.data = addProcessStep(datum.data, key))}
          >Add Process Step</button
        >

        {#if datum.data[key].processSteps.length > 0}
          <div class="process">
            {#each datum.data[key].processSteps as processStep, index}
              <div id={"" + index}>
                {processStep.process}
                {JSON.stringify(processStep.parameters)}
                {i}
              </div>
              <button
                on:click={() =>
                  (datum.data = removeProcessStep(datum.data, key, index))}
                >[-]</button
              >
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/each}
