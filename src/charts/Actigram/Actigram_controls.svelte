<script>
  // @ts-nocheck

  import Slider from "../../utils/Slider.svelte";
  import { graphs, activeGraphTab } from "../../store";

  let datePickVisible = true;

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

  function toggleOpenDatePick() {
    datePickVisible = !datePickVisible;

    const datePickLabel = document.querySelector(".datepicklabel");
    const dateInput = document.querySelector(".dateInput");

    if (datePickVisible) {
      datePickLabel.style.display = "inline-block";
      dateInput.style.width = "18px"; // Set the width back to auto or any other desired value
    } else {
      datePickLabel.style.display = "none";
      dateInput.style.width = "60%";
    }
  }
</script>

<div class="chartControls">
  <div class="sliderContainer">
    <span>Start time: </span>
    <div
      class="datepicklabel datepicklabelshow"
      style="display: inline-block; 
      margin-right: 2px; 
      margin-left: auto;
      text-align: center;"
      on:dblclick={(e) => {
        toggleOpenDatePick();
      }}
    >
      {formatStartTime($graphs[$activeGraphTab].params.startTime)}
    </div>
    <input
      class="dateInput"
      type="datetime-local"
      id="startTime"
      name="startTime"
      bind:value={$graphs[$activeGraphTab].params.startTime}
      on:keydown={(e) => {
        if (e.key === "Enter") {
          toggleOpenDatePick();
        }
      }}
    />
  </div>

  <div class="sliderContainer">
    <Slider
      min={10}
      max={30}
      limits={[1, Infinity]}
      label="Period (hrs):"
      bind:value={$graphs[$activeGraphTab].params.periodHrs}
    />
  </div>

  <div class="sliderContainer">
    <Slider
      min={0.05}
      max={1}
      step="0.05"
      limits={[0.05, $graphs[$activeGraphTab].params.periodHrs]}
      label="Bin size (hrs):"
      bind:value={$graphs[$activeGraphTab].params.binSizeHrs}
    />
  </div>

  <div class="sliderContainer">
    <Slider
      min={100}
      max={1000}
      limits={[5, Infinity]}
      label="Width: "
      bind:value={$graphs[$activeGraphTab].params.width}
    />
  </div>

  <div class="sliderContainer">
    <Slider
      min={10}
      max={30}
      limits={[5, Infinity]}
      label="Day Height:"
      bind:value={$graphs[$activeGraphTab].params.dayHeight}
    />
  </div>

  <div class="sliderContainer">
    <Slider
      min={1}
      max={20}
      limits={[-$graphs[$activeGraphTab].params.dayHeight, Infinity]}
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
    background: var(--primary-color);
    cursor: pointer;
  }

  .datepickshow {
    width: 60%;
  }

  .datepicklabelshow {
    display: inline-block;
  }
  .datepicklabel {
    display: none;
  }

  .dateInput:hover {
    background: #eee;
  }

  ::-webkit-calendar-picker-indicator:hover {
    cursor: pointer;
  }
</style>
