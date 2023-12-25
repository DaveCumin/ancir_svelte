<script>
  import Slider from "../../utils/Slider.svelte";
  import { graphs, activeGraphTab } from "../../store";
</script>

<div class="chartControls">
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
