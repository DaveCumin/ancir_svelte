import { writable } from "svelte/store";

export var counter = writable(0);

export var data = writable([
  {
    id: 9,
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
      },
      value90: {
        name: "value0",
        type: "value",
        data: [1, 2, 3],
        processSteps: [],
        processedData: [],
      },
      value91: {
        name: "value1",
        type: "value",
        data: [10, 11, 15],
        processSteps: [
          {
            process: "limit",
            parameters: { min: 10, max: 12 },
          },
        ],
        processedData: [10, 11, 12],
      },
    },
  },
  {
    id: 6,
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
      value60: {
        name: "value3",
        type: "value",
        data: [10, 11, 16],
        processSteps: [
          {
            process: "limit",
            parameters: { min: 10, max: 10 },
          },
        ],
        processedData: [10, 10, 10],
      },
      value61: {
        name: "value4",
        type: "value",
        data: [5, 6, 8],
        processSteps: [],
        processedData: [],
      },
    },
  },
]);

export var graphTabs = writable([{ name: "tab1" }, { name: "secondTab" }]);
export var activeGraphTab = writable(0);
export var graphs = writable([
  {
    graph: "actigram",
    sourceData: [
      {
        tableID: 9,
        x: { field: "value91", processSteps: [], processedData: [] },
        y: {
          field: "value90",
          processSteps: [{ process: "add", parameters: { val: 15 } }],
          processedData: [],
        },
        col: { r: 24, g: 251, b: 251, a: 1 },
      },
      {
        tableID: 6,
        x: { field: "value60", processSteps: [], processedData: [] },
        y: {
          field: "value61",
          processSteps: [{ process: "add", parameters: { val: 5 } }],
          processedData: [],
        },
        col: { r: 21, g: 21, b: 251, a: 1 },
      },
    ],
    params: { width: 600, dayHeight: 100, betweenHeight: 5 },
  },
  {
    graph: "plotXYZ",
    sourceData: [
      {
        tableID: 6,
        x: {
          field: "value60",
          processSteps: [],
          processedData: [],
        },
        y: {
          field: "value61",
          processSteps: [{ process: "add", parameters: { val: 10 } }],
          processedData: [],
        },
        col: { r: 251, g: 251, b: 25, a: 1 },
      },
    ],
    params: { width: 600 },
  },
]);

export var dataIDsforTables = writable([]);
export var activeTableTab = writable(-1);

export var processModalActive = writable(false);
export var menuModalActive = writable(false);
