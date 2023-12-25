<script>
  import Slider from "../../utils/Slider.svelte";
  import { graphs, activeGraphTab } from "../../store";
</script>

<div class="chartControls">
  <div class="sliderContainer">
    <Slider
      min={100}
      max={1000}
      label="Width:"
      bind:value={$graphs[$activeGraphTab].params.width}
    />
  </div>

  <div class="sliderContainer">
    <Slider
      min={10}
      max={3000}
      label="Height: "
      bind:value={$graphs[$activeGraphTab].params.height}
    />
  </div>

  <div class="sliderContainer">
    <label for="val">X-axis: </label>
    <input
      type="text"
      id="min"
      bind:value={$graphs[$activeGraphTab].params.xAxisLabel}
    />
  </div>
  <div class="sliderContainer">
    <Slider
      min={-10}
      max={30}
      label="Min X:"
      bind:value={$graphs[$activeGraphTab].params.xDomainMin}
    />
  </div>
  <div class="sliderContainer">
    <Slider
      min={-10}
      max={30}
      label="Max X:"
      bind:value={$graphs[$activeGraphTab].params.xDomainMax}
    />
  </div>

  <div class="sliderContainer">
    <label for="val">Y-axis: </label>
    <input
      type="text"
      id="min"
      bind:value={$graphs[$activeGraphTab].params.yAxisLabel}
    />
  </div>
  <div class="sliderContainer">
    <Slider
      min={-10}
      max={30}
      label="Min Y:"
      bind:value={$graphs[$activeGraphTab].params.yDomainMin}
    />
  </div>
  <div class="sliderContainer">
    <Slider
      min={-10}
      max={30}
      label="Max Y:"
      bind:value={$graphs[$activeGraphTab].params.yDomainMax}
    />
  </div>
</div>
