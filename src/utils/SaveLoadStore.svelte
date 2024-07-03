<script context="module">
  import {
    data,
    graphTabs,
    activeGraphTab,
    graphs,
    dataIDsforTables,
    showalldata,
    activeTableTab,
    selectedTheme,
    userStyle,
    statusData,
  } from "../store";
  import { get } from "svelte/store";

  export function saveStoreData() {
    const _data = get(data);
    const _graphTabs = get(graphTabs);
    const _activeGraphTab = get(activeGraphTab);
    const _graphs = get(graphs);
    const _dataIDsforTables = get(dataIDsforTables);
    const _showalldata = get(showalldata);
    const _activeTableTab = get(activeTableTab);
    const _selectedTheme = get(selectedTheme);
    const _userStyle = get(userStyle);
    const _statusData = get(statusData);

    const store = {
      _data,
      _graphTabs,
      _activeGraphTab,
      _graphs,
      _dataIDsforTables,
      _showalldata,
      _activeTableTab,
      _selectedTheme,
      _userStyle,
      _statusData,
    };

    const fileName = "testStore.ancir";

    const jsonContent = JSON.stringify(store);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "data.json";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  export function loadStoreData() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "fileInput";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    fileInput.addEventListener("change", handleFileSelect);
    fileInput.click();
  }

  function loadTheData(jsonString) {
    console.log("TODO: load script not working ");

    const loadedObject = JSON.parse(jsonString);

    const modifiedObject = {};

    for (const key in loadedObject) {
      if (loadedObject.hasOwnProperty(key)) {
        const modifiedKey = key.substring(1); // Remove the first letter
        modifiedObject[modifiedKey] = loadedObject[key];

        eval(`${modifiedKey}.update((current) => {return loadedObject[key]});`);
      }
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const jsonString = e.target.result;
        const resultObject = loadTheData(jsonString);
        console.log(resultObject);
      };

      reader.readAsText(file);
    }
  }
</script>

<fileInput class="loadStore" />
