<script>
  // @ts-nocheck

  import Slider from "../../utils/Slider.svelte";
  import { graphs, activeGraphTab } from "../../store";

  function formatStartTime(timeString) {
    if (timeString) {
      const [datePart, timePart] = timeString.split("T");
      const [year, month, day] = datePart.split("-");
      const [hours, minutes] = timePart.split(":");

      const monthLookup = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthText = monthLookup[+month - 1];

      return `${day} ${monthText} ${year} ${hours}:${minutes}`;
    } else {
      return "";
    }
  }
</script>

<div class="chartControls">
  <div class="sliderContainer">
    <span>Start time: </span>
    <div
      style="display: inline-block; 
      margin-right: 2px; 
      margin-left: auto;
      text-align: center;"
    >
      {formatStartTime($graphs[$activeGraphTab].params.startTime)}
    </div>
    <input
      class="dateInput"
      type="datetime-local"
      id="startTime"
      name="startTime"
      bind:value={$graphs[$activeGraphTab].params.startTime}
      on:change={(e) => {
        console.log(e.target.value);
      }}
    />
  </div>

  <div class="sliderContainer">
    <Slider
      min={10}
      max={30}
      label="Period (hrs):"
      bind:value={$graphs[$activeGraphTab].params.periodHrs}
    />
  </div>

  <div class="sliderContainer">
    <Slider
      min={100}
      max={1000}
      label="Width: "
      bind:value={$graphs[$activeGraphTab].params.width}
    />
  </div>

  <div class="sliderContainer">
    <Slider
      min={10}
      max={30}
      label="Day Height:"
      bind:value={$graphs[$activeGraphTab].params.dayHeight}
    />
  </div>

  <div class="sliderContainer">
    <Slider
      min={1}
      max={20}
      label="Between Height:"
      bind:value={$graphs[$activeGraphTab].params.betweenHeight}
    />
  </div>
</div>

<style>
  .dateInput {
    margin-right: 2px;
    width: 18px;
    padding-right: 4px;
    margin-bottom: 5px;
    margin-top: -3px;
    padding-top: 2px;
    background: lightblue;
    cursor: pointer;
  }
  .dateInput:hover {
    background: #eee;
  }

  ::-webkit-calendar-picker-indicator:hover {
    cursor: pointer;
  }
</style>
