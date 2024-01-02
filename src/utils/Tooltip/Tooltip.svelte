<script>
  export let x;
  export let y;
  export let tipcontent;
</script>

<div class="tooltip" style="top: {y + 5}px;left: {x + 5}px;">
  {tipcontent}
</div>

<style>
  .tooltip {
    position: absolute;
    z-index: 10001;
    background: var(--hover-color);
    padding: 5px;
    border-radius: 10px;
    box-shadow: 0px 0px 15px -5px var(--font-color);
  }
</style>
