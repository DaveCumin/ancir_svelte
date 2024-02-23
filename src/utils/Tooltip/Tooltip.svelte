<script>
  export let tipcontent = "";
  let isHovered = false;
  let x;
  let y;

  function mouseOver(event) {
    isHovered = true;
    x = event.clientX + 5 - 750;
    y = event.clientY + 5 - 60;
  }
  function mouseMove(event) {
    x = event.clientX + 5 - 750;
    y = event.clientY + 5 - 60;
  }

  function mouseLeave() {
    isHovered = false;
  }
</script>

<div
  on:mouseover={mouseOver}
  on:mouseleave={mouseLeave}
  on:mousemove={mouseMove}
>
  <slot />
</div>

{#if isHovered}
  <div style="top: {y}px; left: {x}px;" class="tooltip">
    {tipcontent}
  </div>
{/if}

<style>
  .tooltip {
    transform: none;
    border: 1px solid #ddd;
    box-shadow: 1px 1px 1px #ddd;
    background: white;
    border-radius: 4px;
    padding: 4px;
    position: absolute;
    margin: 0;
    z-index: 9999;
    width: max-content;
  }
</style>
