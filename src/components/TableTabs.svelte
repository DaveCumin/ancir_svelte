<script>
  import { dataIDsforTables, activeTableTab, data } from "../store";

  function changeActiveNav(ind) {
    $activeTableTab = ind;
  }

  function deleteTab(ind) {
    $dataIDsforTables.splice(ind, 1);
    $dataIDsforTables = $dataIDsforTables;
    $activeTableTab = $dataIDsforTables.length > 0 ? 0 : -1;
  }

  //Get the active data
  function getActiveData($activeTableTab) {
    return $dataIDsforTables.length > 0
      ? $data.find((item) => item.id === $dataIDsforTables[$activeTableTab])
      : { data: -1, displayName: -1 };
  }

  //Function nto make a table from the active data
  function makeTableData(dataIN, d) {
    let out = [];
    for (const key in dataIN) {
      if (dataIN[key].processSteps.length > 0) {
        out.push(dataIN[key].processedData);
      } else {
        out.push(dataIN[key].data);
      }
    }

    return out;
  }

  //Get headinngs for the table
  function makeTableHeadings(dataIN, d) {
    if ($dataIDsforTables.length > 0) {
      var outheadings = [];
      var outprocessed = [];
      for (const key in dataIN) {
        outprocessed.push(dataIN[key].processSteps.length);
        outheadings.push(dataIN[key].name);
      }
      return { headings: outheadings, processed: outprocessed };
    } else {
      return { headings: [""], processed: [false] };
    }
  }

  $: tableData = makeTableData(getActiveData($activeTableTab).data, $data);
  $: tableHeadings = makeTableHeadings(
    getActiveData($activeTableTab).data,
    $data
  );
</script>

{#if $activeTableTab < 0}
  <p>Need to add a table</p>
{:else}
  <nav>
    <ul>
      {#each $dataIDsforTables as table, inx}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class={inx === $activeTableTab ? "tab active" : "tab"}
          on:click={() => changeActiveNav(inx)}
        >
          <span
            >{$data[table].displayName}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="delete" on:click={() => deleteTab(inx)}>x</div></span
          >
        </div>
      {/each}
    </ul>
    <main>
      <table>
        <thead
          ><tr>
            {#each tableHeadings.headings as heading, i}
              {#if tableHeadings.processed[i]}
                <th><i>{heading}*</i></th>
              {:else}
                <th>{heading}</th>
              {/if}
            {/each}
          </tr></thead
        >
        <tbody>
          {#each tableData[0] as tdr, row}
            <tr>
              {#each tableData as tdc, col}
                {#if tableHeadings.processed[col]}
                  <td><i>{tableData[col][row]}</i></td>
                {:else}
                  <td>{tableData[col][row]}</td>
                {/if}
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </main>
  </nav>
{/if}

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
    border-bottom: 1px solid #dee2e6;
  }

  span {
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  span:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
  }
  .delete {
    position: absolute;
    right: 3px;
    top: 5px;
    color: #a9a9a9;
    float: right;
    margin-top: -3px;
    margin-right: 12px;
    padding: 2px 4px;
    width: 20px;
    height: 20px;
    opacity: 0.6;
    border: 0;
    border-top: 3px solid transparent;
    border-radius: 3px;
  }
  .delete:hover {
    color: red;
  }

  .tab {
    position: relative;
    padding: 0px 28px 0px 20px;
  }

  .tab.active > span {
    color: #495057;
    background-color: #b8b8b8;
    border-color: #dee2e6 #dee2e6 #fff;
  }
</style>
