<script>
  import {
    dataIDsforTables,
    showalldata,
    activeTableTab,
    data,
  } from "../store";
  import InPlaceEdit from "../utils/InPlaceEdit.svelte";
  import { tooltip } from "../utils/Tooltip/tooltip";

  let minrowstoshow = 100;

  function doshowalldata() {
    $showalldata[$activeTableTab] = true;
  }

  function changeActiveNav(ind) {
    $activeTableTab = ind;
  }

  function deleteTab(ind) {
    $dataIDsforTables.splice(ind, 1);
    $dataIDsforTables = $dataIDsforTables;

    $showalldata.splice(ind, 1);
    $showalldata = $showalldata;

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
      out.push(dataIN[key].data);
      //Add the computed time
      if (dataIN[key].type === "time") {
        out.push(dataIN[key].timeData);
      }
      //Add processed data
      if (dataIN[key].processSteps.length > 0) {
        out.push(dataIN[key].processedData);
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
        outheadings.push(dataIN[key].name);
        outprocessed.push(false);

        //If there is a process, add in the raw data headers first
        if (dataIN[key].processSteps.length > 0) {
          outheadings.push(dataIN[key].name);
          outprocessed.push(true);
        }
        if (dataIN[key].type === "time") {
          outheadings.push(dataIN[key].name + " (hrs)");
          outprocessed.push(true);
        }
      }
      return { headings: outheadings, processed: outprocessed };
    } else {
      return { headings: [""], processed: [false] };
    }
  }

  let tableData;
  $: {
    tableData = makeTableData(getActiveData($activeTableTab).data, $data);
    if (tableData.length > 0) {
      if (tableData[0].length <= minrowstoshow) {
        console.log(tableData[0].length);
        console.log(tableData[0].length <= minrowstoshow);
        $showalldata[$activeTableTab] = true;
      }
    }
  }

  $: tableHeadings = makeTableHeadings(
    getActiveData($activeTableTab).data,
    $data
  );
</script>

<div id="tableTabs" style="margin: 0 1em;">
  {#if $activeTableTab < 0}
    <h3>Need to add a table</h3>
  {:else}
    <nav>
      <ul>
        {#each $dataIDsforTables as table, inx}
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li
            class={$activeTableTab === inx ? "active" : ""}
            on:click={() => changeActiveNav(inx)}
          >
            <span class="tabname">
              <InPlaceEdit
                bind:value={$data[$data.findIndex((d) => d.id === table)]
                  .displayName}
              />
            </span>
            <button class="closeButton" on:click={() => deleteTab(inx)}>
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
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
</div>

{#if $activeTableTab >= 0 && tableData.length > 0}
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
        <!-- only show the whole table if showalldata is true-->
        {#if $showalldata[$activeTableTab]}
          {#each tableData[0] as _, row}
            <tr>
              {#each tableData as _, col}
                {#if tableHeadings.processed[col]}
                  <td><i>{tableData[col][row]}</i></td>
                {:else}
                  <td>{tableData[col][row]}</td>
                {/if}
              {/each}
            </tr>
          {/each}
          <!-- otherwise only show minrowstoshow rows-->
        {:else}
          {#each { length: minrowstoshow } as _, row}
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
        {/if}
      </tbody>
    </table>
  </main>
  <!-- have a button to show all rows-->
  {#if !$showalldata[$activeTableTab]}
    <button
      use:tooltip
      tipcontent="Show more"
      class="showmorebutton"
      style="display: {$showalldata[$activeTableTab] ? 'none' : 'block'};"
      on:click={(e) => doshowalldata()}>...</button
    >
  {/if}
{/if}

<style>
  #tableTabs {
    position: sticky;
    top: 0px;
    left: 0px;
    z-index: 999;
    padding: 0px;
    margin: 0 2.2em 0 0 !important;
  }

  nav {
    margin: 0;
    z-index: 9;
    width: calc(100% + 2.2em);
    background-color: var(--bg-color);
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    border-bottom: 3px solid var(--hover-color);
    margin-top: 2px;
  }
  li {
    margin-bottom: -3px;
    margin-right: 2px;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    background: var(--hover-color);
  }

  span {
    border: 3px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  li.active > span,
  li.active > .closeButton,
  li.active:hover > span {
    border-color: var(--hover-color) var(--hover-color) var(--bg-color);
    background: var(--bg-color);
  }

  li:hover,
  li:hover > span,
  li:hover > .closeButton {
    border-color: var(--hover-color) var(--hover-color) var(--hover-color);
    background: var(--bg-color);
  }

  li.active:hover > span,
  li.active:hover > .closeButton {
    cursor: default;
    background: var(--bg-color);
  }

  .closeButton {
    width: 15px;
    cursor: pointer;
    padding: 0;
    float: right;
    margin-right: 3px;
    margin-top: -32px;
    border: none;
    background-color: var(--hover-color);
  }
  svg:hover {
    stroke: red;
  }

  table {
    border-collapse: collapse;
    width: max-content;
    margin-left: 5px;
  }

  th,
  td {
    border: 1px solid var(--hover-color);
    text-align: left;
    padding: 8px;
  }

  thead th {
    background-color: var(--hover-color);
  }

  .showmorebutton {
    display: flex;
    padding: 0px 10px 5px;
    margin: auto;
    margin-top: 10px;
    margin-bottom: 10px;
    background-color: var(--bg-color);
  }
</style>
