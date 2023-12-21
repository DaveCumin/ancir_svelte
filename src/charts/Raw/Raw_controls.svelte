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
    <label for="val" class="label font-semibold min-w-[130px]">Height:</label>
    <input
      class="input input-bordered input-neutral input-xs focus:outline-none w-20 h-8 mr-2 max-w-xs bg-base-100 shadow-md"
      type="number"
      id="min"
      bind:value={$graphs[$activeGraphTab].params.height}
    />
    <Slider
      min={10}
      max={3000}
      bind:value={$graphs[$activeGraphTab].params.height}
    />
  </div>

  <div class="flex p-2 pl-4 items-center">
    <label for="val" class="label font-semibold min-w-[130px]">X-axis</label>
    <input
      class="input input-bordered input-neutral input-xs focus:outline-none w-20 h-8 mr-2 max-w-xs bg-base-100 shadow-md"
      type="text"
      id="min"
      bind:value={$graphs[$activeGraphTab].params.xAxisLabel}
    />
  </div>
  <div class="flex p-2 pl-4 items-center">
    <label for="val" class="label font-semibold min-w-[130px]">Min X:</label>
    <input
      class="input input-bordered input-neutral input-xs focus:outline-none w-20 h-8 mr-2 max-w-xs bg-base-100 shadow-md"
      type="number"
      id="min"
      bind:value={$graphs[$activeGraphTab].params.xDomainMin}
    />
    <Slider
      min={-10}
      max={30}
      bind:value={$graphs[$activeGraphTab].params.xDomainMin}
    />
  </div>
  <div class="flex p-2 pl-4 items-center">
    <label for="val" class="label font-semibold min-w-[130px]">Max X:</label>
    <input
      class="input input-bordered input-neutral input-xs focus:outline-none w-20 h-8 mr-2 max-w-xs bg-base-100 shadow-md"
      type="number"
      id="min"
      bind:value={$graphs[$activeGraphTab].params.xDomainMax}
    />
    <Slider
      min={-10}
      max={30}
      bind:value={$graphs[$activeGraphTab].params.xDomainMax}
    />
  </div>

  <div class="flex p-2 pl-4 items-center">
    <label for="val" class="label font-semibold min-w-[130px]">Y-axis</label>
    <input
      class="input input-bordered input-neutral input-xs focus:outline-none w-20 h-8 mr-2 max-w-xs bg-base-100 shadow-md"
      type="text"
      id="min"
      bind:value={$graphs[$activeGraphTab].params.yAxisLabel}
    />
  </div>
  <div class="flex p-2 pl-4 items-center">
    <label for="val" class="label font-semibold min-w-[130px]">Min Y:</label>
    <input
      class="input input-bordered input-neutral input-xs focus:outline-none w-20 h-8 mr-2 max-w-xs bg-base-100 shadow-md"
      type="number"
      id="min"
      bind:value={$graphs[$activeGraphTab].params.yDomainMin}
    />
    <Slider
      min={-10}
      max={30}
      bind:value={$graphs[$activeGraphTab].params.yDomainMin}
    />
  </div>
  <div class="flex p-2 pl-4 items-center">
    <label for="val" class="label font-semibold min-w-[130px]">Max Y:</label>
    <input
      class="input input-bordered input-neutral input-xs focus:outline-none w-20 h-8 mr-2 max-w-xs bg-base-100 shadow-md"
      type="number"
      id="min"
      bind:value={$graphs[$activeGraphTab].params.yDomainMax}
    />
    <Slider
      min={-10}
      max={30}
      bind:value={$graphs[$activeGraphTab].params.yDomainMax}
    />
  </div>
</div>
