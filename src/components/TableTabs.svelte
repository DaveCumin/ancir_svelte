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
  <h3>Need to add a table</h3>
{:else}
  <ul class="flex gap-2 items-center pb-2">
    {#each $dataIDsforTables as table, inx}
      <button
        type="button"
        class="btn btn-sm flex items-center gap-2 ml-2 {inx === $activeTableTab
          ? 'bg-gray-700 text-gray-100 '
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} "
        on:click={() => changeActiveNav(inx)}
        >{$data[$data.findIndex((d) => d.id === table)].displayName}
        <button
          class="text-base inline-flex hover:bg-gray-500"
          on:click={() => deleteTab(inx)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </button>
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
{/if}
