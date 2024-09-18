<script>
  import {
    dataIDsforTables,
    showalldata,
    activeTableTab,
    data,
  } from "../store";
  import InPlaceEdit from "../utils/InPlaceEdit.svelte";
  import { saveStoreData } from "../utils/SaveLoadStore.svelte";
  import { forceFormat } from "../utils/time/TimeUtils";

  // make a sequence of integers
  function range(from, to) {
    const result = [];
    let i = from;

    while (i <= to) {
      result.push(i);
      i += 1;
    }

    return result;
  }

  //TODO_med: Make this a popup process, to select the starting data and processes, etc. Maybe an option to paste in data also?
  function newColumn() {
    const newdatadata = range(0, Nrows);
    const newdata = {
      name: "test",
      type: "value",
      originalData: newdatadata,
      processSteps: [],
      data: newdatadata,
    };
    const keyname =
      "processed_" +
      (Object.keys(
        $data.find((item) => item.id === $dataIDsforTables[$activeTableTab])
          .data
      ).length +
        1);

    $data.find((item) => item.id === $dataIDsforTables[$activeTableTab]).data[
      keyname
    ] = newdata;
    $data = $data;
    console.log($data);
  }

  //when there is an edit of data
  function editEvent(event, row, k) {
    console.log(
      $data.find((item) => item.id === $dataIDsforTables[$activeTableTab])
    );
    //If it's a heading, update the name
    if (row == "heading") {
      $data.find((item) => item.id === $dataIDsforTables[$activeTableTab]).data[
        k
      ].name = event.detail;
      $data = $data;
    } else {
      //update the data
      let key = Object.keys(
        $data.find((item) => item.id === $dataIDsforTables[$activeTableTab])
          .data
      )[k];
      $data.find((item) => item.id === $dataIDsforTables[$activeTableTab]).data[
        key
      ].data[row] = event.detail;

      $data = $data;

      //update time if needed
      if (
        $data.find((item) => item.id === $dataIDsforTables[$activeTableTab])
          .data[key].type == "time"
      ) {
        console.log("updating the time data also");
        $data.find(
          (item) => item.id === $dataIDsforTables[$activeTableTab]
        ).data[key].timeData = forceFormat(
          $data.find((item) => item.id === $dataIDsforTables[$activeTableTab])
            .data[key].data,
          $data.find((item) => item.id === $dataIDsforTables[$activeTableTab])
            .data[key].timeFormat
        );
      }
      $data = $data;
    }
  }

  let startRow = 1;
  let endRow = 10;

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

  $: theDataToEdit = $data.find(
    (item) => item.id === $dataIDsforTables[$activeTableTab]
  ) || {
    data: {}, //This is to not throw an error when the Dialog is closed
  };
  $: Nrows = theDataToEdit.datalength;

  function saveData() {
    let headers = [];
    headers.push(
      ...Object.keys(theDataToEdit.data).flatMap((key) => {
        if (theDataToEdit.data[key].type === "time") {
          return [
            theDataToEdit.data[key].name,
            `${theDataToEdit.data[key].name}_calculated`,
          ];
        } else {
          return theDataToEdit.data[key].name;
        }
      })
    );

    //Make the rows of data
    let rows = [];
    const rowCount = theDataToEdit.data.time.data.length; // Assuming all time fields have the same length
    // Iterate over each row
    for (let i = 0; i < rowCount; i++) {
      let row = [];
      Object.keys(theDataToEdit.data).forEach((key) => {
        if (theDataToEdit.data[key].type === "time") {
          row.push(
            `"${theDataToEdit.data[key].data[i]}"`, // Raw time value with quote marks
            theDataToEdit.data[key].timeData[i] // Calculated time value
          );
        } else {
          row.push(theDataToEdit.data[key].data[i]);
        }
      });
      rows.push(row);
    }

    // Convert headers and rows to CSV format
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create a downloadable CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${theDataToEdit.displayName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
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
                bind:value={$data[
                  $data.findIndex(
                    (d) => d.id === $dataIDsforTables[$activeTableTab]
                  )
                ].displayName}
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

{#if $activeTableTab >= 0}
  <main>
    <div id="editTablePagination">
      Show rows <input
        type="number"
        id="min"
        bind:value={startRow}
        min="0"
        max={endRow - 1}
      />
      to
      <input
        type="number"
        id="min"
        bind:value={endRow}
        min={startRow + 1}
        max={Nrows}
      />
      of {Nrows}
      <div class="savedata hoverbutton" on:click={() => saveData()}>💾</div>
    </div>

    <table>
      <thead>
        <tr>
          <td></td>
          {#each Object.keys(theDataToEdit.data) as heading}
            <td
              ><InPlaceEdit
                bind:value={theDataToEdit.data[heading].name}
                on:submit={(event) => editEvent(event, "heading", heading)}
              /></td
            >
            {#if theDataToEdit.data[heading].type == "time"}
              <td><i>{theDataToEdit.data[heading].name}*</i> </td>
            {/if}
          {/each}
          <td><button on:click={newColumn}>+</button> </td>
        </tr>
      </thead>
      <tbody>
        {#each range(Math.max(0, startRow - 1), Math.min(endRow - 1, Nrows)) as i}
          <tr>
            <td><i>{i + 1}</i></td>
            {#each Object.keys(theDataToEdit.data) as heading, c}
              <td
                ><InPlaceEdit
                  bind:value={theDataToEdit.data[heading].data[i]}
                  on:submit={(event) => editEvent(event, i, c)}
                /></td
              >
              {#if theDataToEdit.data[heading].type == "time"}
                <td><i>{theDataToEdit.data[heading].timeData[i]}</i> </td>
              {/if}
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </main>
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
