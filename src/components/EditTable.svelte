<script>
  import { data, menuModalType } from "../store";
  import Dialog from "./Dialog.svelte";
  import InPlaceEdit from "../utils/InPlaceEdit.svelte";

  function getTableIDtoEdit(str) {
    const match = str?.match(/_(\d+)$/);
    if (match) {
      return parseInt(match[1], 10); // Convert the matched number to an integer
    }
    return null; // Return null if no match is found
  }

  function range(from, to) {
    const result = [];
    let i = from;

    while (i <= to) {
      result.push(i);
      i += 1;
    }

    return result;
  }

  function editEvent(event, row, k) {
    console.log(row);
    console.log(k);
    console.log(event.detail);
    //If it's a heading, update the name
    if (row == "heading") {
      $data.find((item) => item.id === theDataToEditId).data[k].name =
        event.detail;
      $data = $data;
    } else {
      //update the data
      let key = Object.keys(
        $data.find((item) => item.id === theDataToEditId).data
      )[k];
      console.log(key);
      console.log($data);
      $data.find((item) => item.id === theDataToEditId).data[key].data[row] =
        event.detail;
      $data = $data;
    }
    console.log(row);
    console.log(k);
    console.log(event.detail);
  }

  $: theDataToEditId = getTableIDtoEdit($menuModalType);
  $: theDataToEdit = $data.find((item) => item.id === theDataToEditId) || {
    data: {}, //This is to not throw an error when the Dialog is closed
  };
  $: Nrows = theDataToEdit.datalength;

  let startRow = 0;
  let endRow = 10;
</script>

{#if $menuModalType?.includes("editTable") && theDataToEdit}
  <Dialog title={"Edit " + theDataToEdit.displayName}>
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
          {/each}
          <td>+</td>
        </tr>
      </thead>
      <tbody>
        {#each range(startRow, endRow) as i}
          <tr>
            <td><i>{i}</i></td>
            {#each Object.keys(theDataToEdit.data) as heading, c}
              <td
                ><InPlaceEdit
                  bind:value={theDataToEdit.data[heading].data[i]}
                  on:submit={(event) => editEvent(event, i, c)}
                /></td
              >
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </Dialog>
{/if}

<style>
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
</style>
