<script>
  // @ts-nocheck

  import Slider from "../../utils/Slider.svelte";
  import { graphs, activeGraphTab } from "../../store";
</script>

{#if $activeGraphTab >= 0}
  <div class="chartControls">
    <div class="sliderContainer">
      <Slider
        min={10}
        max={$graphs[$activeGraphTab].params.maxPeriod}
        limits={[1, Infinity]}
        label="Min period:"
        bind:value={$graphs[$activeGraphTab].params.minPeriod}
      />
    </div>
    <div class="sliderContainer">
      <Slider
        min={$graphs[$activeGraphTab].params.minPeriod}
        max={30}
        limits={[1, Infinity]}
        label="Max period:"
        bind:value={$graphs[$activeGraphTab].params.maxPeriod}
      />
    </div>
    <div class="sliderContainer">
      <Slider
        min={0.1}
        max={1}
        step={0.01}
        limits={[0.1, 1]}
        label="Period step:"
        bind:value={$graphs[$activeGraphTab].params.stepPeriod}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={0.05}
        max={1}
        step="0.05"
        limits={[0.05, $graphs[$activeGraphTab].params.maxPeriod]}
        label="Bin size (hrs):"
        bind:value={$graphs[$activeGraphTab].params.binSizeHrs}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={100}
        max={1000}
        step="1"
        limits={[5, Infinity]}
        label="Width: "
        bind:value={$graphs[$activeGraphTab].params.width}
      />
    </div>

    <div class="sliderContainer">
      <Slider
        min={10}
        max={30}
        step="1"
        limits={[5, Infinity]}
        label="Height:"
        bind:value={$graphs[$activeGraphTab].params.height}
      />
    </div>
  </div>
{/if}
