<script>
  // @ts-nocheck

  import { data, importFileOpen } from "../store";
  import {
    guessDateofArray,
    forceFornat,
    getPeriod,
  } from "../utils/time/TimeUtils";
  import Papa from "papaparse";

  let specialValues = ["NaN", "NA", "null"];
  let files;
  let dataOUT;

  $: if (files) {
    console.log(`${files[0].name}: ${files[0].size} bytes`);

    Papa.parse(files[0], {
      header: true,
      dynamicTyping: true,
      error: function (err, file, inputElem, reason) {
        console.log("Error: " + err + " | " + reason);
      },
      complete: function (results) {
        console.log(files[0].name);
        console.log(results.meta);
        console.log(results.data);
        doBasicFileImport(results, files[0].name);
      },
    });
  }

  $: {
    if ($importFileOpen) {
      const fileInput = document.getElementById("fileInput");
      fileInput.click();
      $importFileOpen = false;
    }
  }

  // do the heavy lifting for 'simple' csv files
  function doBasicFileImport(result, fname) {
    //set up the high-level structure
    makeSkeletonOUT(fname);
    dataOUT.datalength = result.data.length;

    //insert a data element for each header
    result.meta.fields.forEach((f) => {
      //find the data type based on the first non-NaN element
      const datum = getFirstValid(result.data, f);
      let type = "";
      if (!isNaN(datum)) {
        console.log(dataOUT.data);
        dataOUT.data[f] = {
          name: f,
          type: "value",
          data: result.data.map((d) => d[f]),
          processSteps: [],
          processedData: [],
        };
        console.log(dataOUT);
      } else if (guessDateofArray([datum]) != -1) {
        const timefmt = guessDateofArray([datum]);
        dataOUT.data[f] = {
          name: f,
          type: "time",
          data: result.data.map((d) => d[f]),
          timeFormat: timefmt,
          timeData: forceFornat(
            result.data.map((d) => d[f]),
            timefmt
          ),
          recordPeriod: getPeriod(datum, timefmt),
          processSteps: [],
          processedData: [],
        };
      } else {
        //TODO: deal with categorical data
        type = "category";
      }
    });
    $data.push(dataOUT);
    $data = $data;
    console.log(dataOUT);
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
</script>

<input
  type="file"
  id="fileInput"
  style="display: none;"
  accept=".csv,.txt,.TXT"
  bind:files
/>
