<script context="module">
  import { DateTime } from "luxon";
  import { getRandomHexColour } from "../AllCharts.js";

  //default values for creating a new plot
  export const defaultParams = {
    startTime: DateTime.now()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .toISO()
      .slice(0, 16),
    periodHrs: 24,
    binSizeHrs: 0.25,
    width: 800,
    dayHeight: 10,
    betweenHeight: 2,
    doublePlot: 2,
    scaleAxes: "byPlot",
    showAxes: false,
  };

  export const defaultchartvalues = { time: "time", values: "values" };

  export const defaultother = {
    col: { hex: getRandomHexColour(), alpha: 0.5 },
    onsets: [],
  };

  export const defaultChartData = {
    data: [{ time: [], values: [], day: [], scaleLimits: [] }],
    startOffsets: [],
    onsets: [],
    annotations: [],
  };

  export const defaultAnnotation = {
    name: "annotation",
    startTime: DateTime.now()
      .set({ hour: 12, minute: 30, second: 0, millisecond: 0 })
      .toISO()
      .slice(0, 16),
    lengthHrs: 1,
    col: { hex: getRandomHexColour(), alpha: 0.5 },
  };
</script>
