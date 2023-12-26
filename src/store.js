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
        name: "t",
        type: "time",
        data: [
          "10/1/2023, 10:35:00 AM",
          "10/1/2023, 10:40:00 AM",
          "10/1/2023, 10:45:00 AM",
        ],
        timeFormat: "M/D/YYYY, hh:mm:ss A",
        timeData: [0, 0.08333, 0.1666],
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
        timeFormat: "M/D/YYYY, hh:mm:ss A",

        timeData: [0, 0.08333, 0.1666],
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
            parameters: { min: 11, max: 12 },
          },
        ],
        processedData: [11, 11, 12],
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
    id: 0,
    sourceData: [
      {
        tableID: 9,
        name: "My first Actigram data here",
        chartvalues: {
          time: { field: "value91", processSteps: [], processedData: [] },
          values: {
            field: "value90",
            processSteps: [{ process: "add", parameters: { val: 15 } }],
            processedData: [16, 17, 18],
          },
        },
        col: { hex: "#19ff25", alpha: 0.7 },
      },
      {
        tableID: 6,
        name: "More data",
        chartvalues: {
          time: { field: "value60", processSteps: [], processedData: [] },
          values: {
            field: "value61",
            processSteps: [{ process: "add", parameters: { val: 5 } }],
            processedData: [10, 11, 13],
          },
        },
        col: { hex: "#891211", alpha: 0.6 },
      },
    ],
    params: {
      startTime: "2023-10-02T11:35",
      periodHrs: 24,
      width: 400,
      dayHeight: 100,
      betweenHeight: 5,
    },
  },
  {
    graph: "raw",
    id: 1,
    name: "Playing raw",
    sourceData: [
      {
        tableID: 6,
        name: "test data",
        chartvalues: {
          x: {
            field: "value60",
            processSteps: [],
            processedData: [],
          },
          y: {
            field: "value61",
            processSteps: [{ process: "add", parameters: { val: 10 } }],
            processedData: [15, 16, 18],
          },
        },
        col: { hex: "#3469ff", alpha: 1 },
      },
    ],
    params: {
      width: 600,
      height: 200,
      yDomainMin: 0,
      yDomainMax: 20,
      xDomainMin: 0,
      xDomainMax: 20,
      yAxisLabel: "y-axis",
      xAxisLabel: "x-axis title here",
    },
  },
]);

export var dataIDsforTables = writable([]);
export var activeTableTab = writable(-1);

export var menuModalActive = writable(false);
export var contextMenu = writable({
  labels: ["test", "test2"],
  funcs: [
    function a() {
      console.log("a");
    },
    function b() {
      console.log("b");
      console.log("C");
    },
  ],
});

export let selectedTheme = writable("light");
