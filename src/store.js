import { writable } from "svelte/store";

export var counter = writable(0);

export var data = writable([
  {
    id: 0,
    importedFrom: "simulated(24,200)",
    displayName: "Simulated1",
    datalength: 3,
    data: {
      time: {
        name: "time",
        type: "time",
        data: [
          "10/1/2023, 10:35:00 AM",
          "10/1/2023, 10:40:00 AM",
          "10/1/2023, 10:45:00 AM",
        ],
        processSteps: [],
        processedData: [],
        processedsummary: {},
      },
      value0: {
        name: "value0",
        type: "value",
        data: [1, 2, 3],
        processSteps: [],
        processedData: [],
      },
      value1: {
        name: "value1",
        type: "value",
        data: [10, 11, 15],
        processSteps: [
          {
            process: "limit",
            parameters: { highlow: "high", limit: 12 },
          },
        ],
        processedData: [10, 11, 12],
      },
    },
  },
  {
    id: 1,
    importedFrom: "simulated(25,200)",
    displayName: "Simulated2",
    datalength: 3,
    data: {
      time: {
        name: "time",
        type: "time",
        data: [
          "10/2/2023, 11:35:00 AM",
          "10/2/2023, 11:40:00 AM",
          "10/2/2023, 11:45:00 AM",
        ],
        processSteps: [],
        processedData: [],
      },
      value1: {
        name: "value3",
        type: "value",
        data: [10, 11, 15],
        processSteps: [
          {
            process: "limit",
            parameters: { highlow: "high", limit: 10 },
          },
        ],
        processedData: [10, 10, 10],
      },
      value0: {
        name: "value4",
        type: "value",
        data: [5, 6, 7],
        processSteps: [],
        processedData: [],
      },
    },
  },
]);

export var graphTabs = writable([{ name: "tab1" }, { name: "secondTab" }]);
export var activeGraphTab = writable(0);
export var graphs = writable([
  { graph: "actigram", params: { data: "abc123", width: 500 } },
  { graph: "plotXYZ", params: { data: "def", width: 600 } },
]);

export var dataIDsforTables = writable([0]);
export var activeTableTab = writable(0);

export var modalActive = writable(false);
