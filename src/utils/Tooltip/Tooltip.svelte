<script>
  export let tipcontent = "";
  let isHovered = false;
  let x;
  let y;

  function mouseOver(event) {
    console.log(event);
    isHovered = true;
    x = 15;
    y = 35;
  }
  function mouseMove(event) {
    x = 15;
    y = 35;
  }

  function mouseLeave() {
    isHovered = false;
  }
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:mouseover={mouseOver}
  on:mouseleave={mouseLeave}
  on:mousemove={mouseMove}
  style="position: relative;"
>
  <slot />
  {#if isHovered}
    <div style="top: {y}px; left: {x}px;" class="tooltip">
      {tipcontent}
    </div>
  {/if}
</div>

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
