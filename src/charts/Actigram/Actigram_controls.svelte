<script>
  import ChartMaster from "../ChartMaster.svelte";
  import Slider from "../../utils/Slider.svelte";
  import { graphs, activeGraphTab } from "../../store";
</script>

<ChartMaster />

<div
  class="relative p-2.5 m-1.5 shadow-inner border rounded shadow-xl transition ease-in-out delay-75 bg-base-100 hover:bg-base-200 duration-200"
>
  <div class="flex pl-4 items-center">
    <label for="val" class="label font-semibold min-w-[130px]">Width:</label>
    <input
      class="input input-bordered input-neutral input-xs focus:outline-none w-20 h-8 mr-2 max-w-xs mb-1 bg-base-100 shadow-md"
      type="number"
      id="min"
      bind:value={$graphs[$activeGraphTab].params.width}
    />
    <Slider
      min={100}
      max={1000}
      bind:value={$graphs[$activeGraphTab].params.width}
    />
  </div>

  <div class="flex p-2 pl-4 items-center">
    <label for="val" class="label font-semibold min-w-[130px]">dayHeight:</label
    >
    <input
      class="input input-bordered input-neutral input-xs focus:outline-none w-20 h-8 mr-2 max-w-xs bg-base-100 shadow-md"
      type="number"
      id="min"
      bind:value={$graphs[$activeGraphTab].params.dayHeight}
    />
    <Slider
      min={10}
      max={30}
      bind:value={$graphs[$activeGraphTab].params.dayHeight}
    />
  </div>

  <div class="flex p-2 pl-4 pb-10 items-center">
    <label for="val" class="label font-semibold min-w-[130px]"
      >betweenHeight:</label
    >
    <input
      class="input input-bordered input-neutral input-xs focus:outline-none w-20 h-8 mr-2 max-w-xs bg-base-100 shadow-md"
      type="number"
      id="min"
      bind:value={$graphs[$activeGraphTab].params.betweenHeight}
    />
    <Slider
      min={1}
      max={20}
      bind:value={$graphs[$activeGraphTab].params.betweenHeight}
    />
  </div>
</div>
