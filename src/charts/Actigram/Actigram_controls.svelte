<script>
  import ChartGRaphData_xyc from "../ChartGraphData_xyc.svelte";
  import Slider from "../../utils/Slider.svelte";
  import {
    data,
    graphs,
    activeGraphTab,
    dataIDsforTables,
    activeTableTab,
  } from "../../store";
</script>

<ChartGRaphData_xyc />
<div class='relative p-2.5 m-1.5 shadow-inner bg-indigo-100 hover:bg-indigo-200 border rounded shadow-xl hover:transition-all'>

  <div class='flex pl-4 items-center'>
    <label for="val" class="label font-semibold min-w-[130px]">Width:</label>
    <input
      class="input input-bordered input-info h-10 w-24 mr-2 max-w-xs mb-1 bg-blue-50 shadow-md"
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
  
    <div class='flex p-2 pl-4 items-center'>
         <label for="val" class='label font-semibold  min-w-[130px]'>dayHeight:</label>  
    <input
    class="input input-bordered input-info w-24 h-10 mr-2 max-w-xs bg-blue-50 shadow-md"
  
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
  
     <div class='flex p-2 pl-4 pb-10 items-center'>
         <label for="val" class='label font-semibold  min-w-[130px]'>betweenHeight:</label>
         <input
         class="input input-bordered input-info w-24 h-10 mr-2 max-w-xs bg-blue-50 shadow-md"
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
