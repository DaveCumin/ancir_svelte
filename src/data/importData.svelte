<script>
  // @ts-nocheck
  import Dialog from "../components/Dialog.svelte";
  import { tick } from "svelte";
  import { data, menuModalType } from "../store";
  import {
    guessDateofArray,
    forceFormat,
    getPeriod,
  } from "../utils/time/TimeUtils";
  import Papa from "papaparse";

  let specialValues = ["NaN", "NA", "null"];
  let filesToImport;
  let dataOUT;
  let tempData = {};
  let error = {};
  let useHeaders = true;
  const tableRows = 6;

  $: if ($menuModalType === "import") {
    openFileChoose();
  }

  async function openFileChoose() {
    //reset the values
    tempData = {};
    error = {};
    useHeaders = true;

    //wait for input to be loaded
    await tick();

    //click it
    const fileInput = document.getElementById("fileInput");
    fileInput.click();
  }

  $: if (filesToImport) {
    doPapa(200); //preview the data - need 200 to account for actiware data
  }

  //do the Papa parse stuff
  function doPapa(previewIN = 0) {
    return new Promise((resolve) => {
      console.log("doing papa " + previewIN);
      Papa.parse(filesToImport[0], {
        preview: previewIN,
        header: useHeaders,
        dynamicTyping: true,
        error: function (err, file, inputElem, reason) {
          console.log("Error: " + err + " | " + reason);
          tempData = {};
          error = { err, reason };
          resolve(); // Resolve the Promise even in case of an error
        },
        complete: function (results) {
          console.log("complete...");
          error = {};
          dealWithData(results);
          resolve(); // Resolve the Promise when parsing is complete
        },
      });
    });
  }

  //deal with the data - actiware, clocklab, etc
  function dealWithData(dataIN) {
    //Check for actiware
    if (
      (!Array.isArray(dataIN.data[0]) &&
        Object.keys(dataIN.data[0])[0].includes("Actiware Export File")) ||
      dataIN.data[0][0].includes("Actiware Export File")
    ) {
      console.log("acti");
      if (useHeaders) {
        console.log("actiPreview");
        //get the headers - which are in line 148
        const ActiHeaders = dataIN.data[148].__parsed_extra;

        //get the data, which start at line 150
        let actiData = dataIN.data.splice(150, dataIN.data.length - 150);

        //set up the data
        tempData = { data: [], meta: { fields: [] } };

        //go over the data to fill in tempData
        for (const row of actiData) {
          const entry = {};

          for (let i = 0; i < ActiHeaders.length; i++) {
            const header = ActiHeaders[i];
            const value = row.__parsed_extra[i];

            if (header === "Date") {
              // Combine Date and Time into a single datetime field
              entry["datetime"] = `${
                row.__parsed_extra[ActiHeaders.indexOf("Date")]
              } ${row.__parsed_extra[ActiHeaders.indexOf("Time")].replace(
                /\b([ap])\.m\./gi,
                (match, group) => group.toUpperCase() + "M"
              )}`; // the replace convers the a.m. or p.m. to AM or PM so it can be a time
            } else if (header === "Time") {
              //do nothing as it's taken care of above.
            } else {
              entry[header] = value;
            }
          }
          tempData.data.push(entry);
        }

        //make headers
        for (let i = 0; i < ActiHeaders.length; i++) {
          if (ActiHeaders[i] === "Date") {
            tempData.meta.fields.push("datetime");
          } else if (ActiHeaders[i] === "Time") {
            //do nothing as it's taken care of above.
          } else {
            tempData.meta.fields.push(ActiHeaders[i]);
          }
        }
        useHeaders = false; //set the headers to be false
      } //If it was the preview
      //Now do the real import
      else {
        console.log("actiReal");
        const ActiHeaders = dataIN.data[149];

        //get the data, which start at line 151
        let actiData = dataIN.data.splice(151, dataIN.data.length - 151);

        //set up the data
        tempData = { data: [], meta: { fields: [] } };

        //go over the data to fill in tempData
        for (const row of actiData) {
          if (row.length === 1) {
            continue;
          }
          const entry = {};

          for (let i = 0; i < ActiHeaders.length; i++) {
            const header = ActiHeaders[i];
            const value = row[i];

            if (header === "Date") {
              // Combine Date and Time into a single datetime field
              entry["datetime"] = `${row[ActiHeaders.indexOf("Date")]} ${row[
                ActiHeaders.indexOf("Time")
              ].replace(
                /\b([ap])\.m\./gi,
                (match, group) => group.toUpperCase() + "M"
              )}`; // the replace convers the a.m. or p.m. to AM or PM so it can be a time
            } else if (header === "Time") {
              //do nothing as it's taken care of above.
            } else {
              entry[header] = value;
            }
          }
          tempData.data.push(entry);
        }

        //make headers
        for (let i = 0; i < ActiHeaders.length; i++) {
          if (ActiHeaders[i] === "Date") {
            tempData.meta.fields.push("datetime");
          } else if (ActiHeaders[i] === "Time") {
            //do nothing as it's taken care of above.
          } else {
            tempData.meta.fields.push(ActiHeaders[i]);
          }
        }
        tempData.meta.note = "Actiware data";
        console.log(tempData);
      } //the 'real' import of actigram
    } else {
      console.log("basic");
      tempData = dataIN;
    }
  }

  //Load the data once all operations have been completed
  async function loadData() {
    console.log("loading...");
    await doPapa(0); //load all the data
    console.log(tempData);
    //TODO: perorm the required manipulations
    doBasicFileImport(tempData, filesToImport[0].name); //LOAD THE DATA
    $menuModalType = ""; //close the dialog
  }

  // do the heavy lifting for 'simple' csv files
  function doBasicFileImport(result, fname) {
    // Filter out rows where all values are null or undefined
    const allValuesNullOrUndefined = (obj) =>
      Object.values(obj).every(
        (value) => value === null || value === undefined
      );
    result.data = result.data.filter((row) => !allValuesNullOrUndefined(row));

    //set up the high-level structure
    makeSkeletonOUT(fname);
    dataOUT.datalength = result.data.length;

    //insert a data element for each header
    result.meta.fields.forEach((f) => {
      //find the data type based on the first non-NaN element
      const datum = getFirstValid(result.data, f);
      let type = "";
      if (!isNaN(datum)) {
        dataOUT.data[f] = {
          name: f,
          type: "value",
          data: result.data.map((d) => d[f]),
          processSteps: [],
          processedData: [],
        };
      } else if (guessDateofArray([datum]) != -1) {
        const timefmt = guessDateofArray([datum]);
        console.log("guessedformat = " + timefmt);
        dataOUT.data[f] = {
          name: f,
          type: "time",
          data: result.data.map((d) => d[f]),
          timeFormat: timefmt,
          timeData: forceFormat(
            result.data.map((d) => d[f]),
            timefmt
          ),
          recordPeriod: getPeriod(datum, timefmt),
          processSteps: [],
          processedData: [],
        };
      } else {
        dataOUT.data[f] = {
          name: f,
          type: "category",
          data: result.data.map((d) => d[f]),
          processSteps: [],
          processedData: [],
        };
      }
    });
    $data.push(dataOUT);
    $data = $data;
  }

  // create a skeleton dataOut
  function makeSkeletonOUT(fname) {
    dataOUT = {
      id: getID(),
      importedFrom: fname,
      displayName: "data_" + getID(),
      datalength: NaN,
      data: {},
    };
  }

  //get the next highest id
  function getID() {
    if ($data.length === 0) {
      return 0;
    }
    let ids = [];
    $data.forEach((d) => ids.push(d.id));
    return Math.max(...ids) + 1;
  }

  // get the first valid data point in the result, given key
  function getFirstValid(data, key) {
    for (const entry of data) {
      const value = entry[key];
      if (value !== null && value !== "" && !specialValues.includes(value)) {
        return value;
      }
    }
    // Return a default value if no valid value is found
    return null;
  }

  //make a table from the data
  function makeTempTable(tempData) {
    let table = "<table><thead><tr>";
    tempData.meta.fields.forEach((heading) => (table += `<th>${heading}</th>`));
    table += "</tr></thead><tbody>";
    for (let r = 0; r < tableRows; r++) {
      table += "<tr>";
      for (let c = 0; c < tempData.meta.fields.length; c++) {
        table += `<td>${tempData.data[r][tempData.meta.fields[c]]}</td>`;
      }
      table += "</tr>";
    }
    table += "</tbody></table>";
    return table;
  }
</script>

{#if $menuModalType === "import"}
  <Dialog title="IMPORT">
    <input
      type="file"
      id="fileInput"
      accept=".csv, .txt, .TXT"
      style="display:none;"
      bind:files={filesToImport}
    />
    <!-- show -->
    {#if Object.keys(tempData).length === 0}
      <button on:click={openFileChoose}>Choose file</button>
    {/if}
    <!-- show errors if there are any-->
    {#if Object.keys(error).length}
      <div class="error">
        {JSON.stringify(error)}
      </div>
    {/if}
    <!-- show the table of the temp data and allow manipulations -->
    {#if Object.keys(tempData).length}
      <p>{filesToImport[0].name}</p>
      <button on:click={openFileChoose}>Change file</button>
      <hr />
      <p>Preview of the data:</p>
      <p>{@html makeTempTable(tempData)}</p>
      <hr />
      <button on:click={loadData}>Import</button>
    {/if}
  </Dialog>
{/if}
