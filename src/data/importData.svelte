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

  const specialValues = ["NaN", "NA", "null"];
  const previewTableNrows = 6;

  let filesToImport;
  let tempData = {};
  let error = {};
  let skipLines = 0;
  let useHeaders = true;
  let flagExtraData = false;
  let errorInfile = false;
  let specialRecognised = false;

  $: if ($menuModalType === "import") {
    openFileChoose();
  }

  async function openFileChoose() {
    //reset the values
    tempData = {};
    error = {};
    useHeaders = true;
    flagExtraData = false;
    errorInfile = false;
    specialRecognised = false;

    //wait for input to be loaded
    await tick();

    //click it
    const fileInput = document.getElementById("fileInput");
    fileInput.click();
  }

  $: if (filesToImport) {
    parseFile(skipLines + previewTableNrows + useHeaders); //preview the data - need 200 to account for actiware data
  }

  //do the Papa parse stuff
  function parseFile(previewIN = 0) {
    errorInfile = false; //reset the errors
    return new Promise((resolve) => {
      console.log(
        "doing papa previewIN= " + previewIN + ", useHeaders= " + useHeaders
      );

      //Do the business
      Papa.parse(filesToImport[0], {
        preview: previewIN,
        header: useHeaders,
        dynamicTyping: true,
        skipEmptyLines: "greedy",
        error: function (err, file, inputElem, reason) {
          console.log("Error: " + err + " | " + reason);
          tempData = {};
          error = { err, reason };
          resolve(); // Resolve the Promise even in case of an error
        },
        //Remove the first skipLines lines of the file before parsing
        beforeFirstChunk: (chunk) => {
          const lines = chunk.split(/\r\n|\r|\n/); // Split the content into lines
          console.log(lines);
          const firstLines = skipLines
            ? lines.splice(0, skipLines) // Remove the first N lines if there are skiplines
            : lines[0].split(/[,;\t]/); //else take a sample of the first line to check for filetype (Actiware, etc)

          //check for Actiware data - and remove appropriate lines, if so
          if (
            firstLines[0].includes("Actiware Export File") &&
            !specialRecognised
          ) {
            console.log("ACTIWARE");
            specialRecognised = "actiware";
            skipLines = 148; /// the number of lines for an Actiware file before the data starts
            parseFile(skipLines + previewIN + 1);
          }

          return lines.join("\n"); // Join the remaining lines back into a single string
        },
        complete: function (results, file) {
          console.log("Parsing complete:", results, file);
          console.log(results);
          if (results.errors.length > 0) {
            errorInfile = true;
          }
          dealWithData(results.data);
          resolve(); // Resolve the Promise when parsing is complete
        },
      });
    });
  }

  //deal with the data - actiware, clocklab, etc
  function dealWithData(dataIN) {
    console.log("DEALING WITH DATA...");
    console.log(dataIN);
    //convert the data into an object of arrays
    tempData = convertArrayToObject(dataIN);

    if (specialRecognised === "actiware") {
      tempData["DateTime"] = [];
      for (let i = 0; i < tempData["Date"].length; i++) {
        tempData["DateTime"].push(
          tempData["Date"][i] +
            " " +
            tempData["Time"][i].replace(
              /\b([ap])\.m\./gi,
              (match, group) => group.toUpperCase() + "M"
            )
        ); // the replace convers the a.m. or p.m. to AM or PM so it can be a time;
      }
    }

    console.log(tempData);
  }

  //Converts the array into an object - more like AnCir uses
  function convertArrayToObject(inputArray) {
    try {
      let resultObject = {};

      // Loop through each object in the array
      inputArray.forEach((item) => {
        // Loop through each key in the object
        Object.keys(item).forEach((key) => {
          // Initialize the array for the key if it doesn't exist
          if (!resultObject[key]) {
            resultObject[key] = [];
          }

          // Push the value to the corresponding array
          resultObject[key].push(item[key]);
        });
      });

      //change the keys to the first values if useHeader and extra
      if (flagExtraData && useHeaders) {
        resultObject = changeObjectKeys(resultObject, inputArray[0]);
      }

      return resultObject;
    } catch (error) {
      console.error("Error converting array to object:", error);
      return {};
    }
  }

  //change the keys to a new array
  function changeObjectKeys(object, newKeys) {
    console.log(object);
    const newObject = {};

    // Loop through the keys of the original object
    Object.keys(object).forEach((originalKey, i) => {
      // Create the new key
      const newKey = newKeys[i] || originalKey;
      // Assign the values to the new key in the new object
      object[originalKey].splice(0, 1); // remove the first value, as it's the header
      newObject[newKey] = object[originalKey];
    });

    return newObject;
  }

  //Load the data once all operations have been completed
  async function loadData() {
    console.log("loading...");
    await parseFile(0); //load all the data
    console.log(tempData);
    //TODO: perorm the required manipulations
    doBasicFileImport(tempData, filesToImport[0].name); //LOAD THE DATA
    $menuModalType = ""; //close the dialog
  }

  // put the data into the tool store
  //TODO: check the logic here, as the Sampling freq isn't updating properly for times.
  function doBasicFileImport(result, fname) {
    console.log(result);
    console.log(fname);

    //set up the high-level structure
    let dataOUT = {
      id: getID(),
      importedFrom: fname,
      displayName: "data_" + getID(),
      datalength: NaN,
      data: {},
    };

    dataOUT.datalength = result[Object.keys(result)[0]].length;

    //insert a data element for each header
    Object.keys(result).forEach((f) => {
      //find the data type based on the first non-NaN element
      const datum = getFirstValid(result[f]);
      let type = "";
      console.log(datum + " : " + guessDateofArray([datum]));
      if (guessDateofArray([datum]) != -1) {
        const timefmt = guessDateofArray([datum]);
        console.log("guessedformat = " + timefmt);
        dataOUT.data[f] = {
          name: f,
          type: "time",
          data: result[f],
          timeFormat: timefmt,
          timeData: forceFormat(result[f], timefmt),
          recordPeriod: getPeriod(datum, timefmt),
          processSteps: [],
          processedData: [],
        };
      } else if (!isNaN(datum)) {
        dataOUT.data[f] = {
          name: f,
          type: "value",
          data: result[f],
          processSteps: [],
          processedData: [],
        };
      } else {
        dataOUT.data[f] = {
          name: f,
          type: "category",
          data: result[f],
          processSteps: [],
          processedData: [],
        };
      }
    });
    console.log(dataOUT);
    $data.push(dataOUT);
    $data = $data;
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
  function getFirstValid(data) {
    for (const value of data) {
      if (value !== null && value !== "" && !specialValues.includes(value)) {
        return value;
      }
    }
    // Return a default value if no valid value is found
    return null;
  }

  //make a table from the data
  function makeTempTable(tempData) {
    //If there is no data, report an error
    if (Object.keys(tempData).length === 0) {
      return "There was an error reading the file " + filesToImport[0].name;
    }

    let table = "<table><thead><tr>";
    Object.keys(tempData).forEach(
      (heading) => (table += `<th>${heading}</th>`)
    );
    table += "</tr></thead><tbody>";
    for (let r = 0; r < previewTableNrows; r++) {
      table += "<tr>";
      for (let c = 0; c < Object.keys(tempData).length; c++) {
        table += `<td>${tempData[Object.keys(tempData)[c]][r]}</td>`;
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
      <input type="number" bind:value={skipLines} />
      <input type="checkbox" label="headers" bind:checked={useHeaders} />
    {/if}

    <!-- show errors if there are any-->
    {#if Object.keys(error).length}
      <div class="error">
        {JSON.stringify(error)}
      </div>
    {/if}
    <!-- show the table of the temp data and allow manipulations -->
    {#if errorInfile}
      <p>{filesToImport[0].name}</p>
      <button on:click={openFileChoose}>Change file</button>
      <input
        type="checkbox"
        label="headers"
        bind:checked={useHeaders}
        on:change={() => parseFile(skipLines + previewTableNrows + useHeaders)}
      />
      <input
        type="number"
        bind:value={skipLines}
        on:input={() => parseFile(skipLines + previewTableNrows + useHeaders)}
      />
      <hr />
      <p>There was an error reading the file.</p>
      <hr />
    {:else if Object.keys(tempData).length}
      <p>{filesToImport[0].name}</p>
      <button on:click={openFileChoose}>Change file</button>
      <input
        type="checkbox"
        label="headers"
        bind:checked={useHeaders}
        on:change={() => parseFile(skipLines + previewTableNrows + useHeaders)}
      />
      <input
        type="number"
        bind:value={skipLines}
        on:input={() => parseFile(skipLines + previewTableNrows + useHeaders)}
      />

      <p>Preview of the data:</p>
      <hr />
      <p>{@html makeTempTable(tempData)}</p>
      <hr />
      <button on:click={loadData}>Import</button>
    {/if}
    <!-- show error message if there are errors-->
  </Dialog>
{/if}
