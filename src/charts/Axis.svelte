<script>
  // @ts-nocheck
  import { select, selectAll } from "d3-selection";
  import { axisBottom, axisLeft, axisTop, axisRight } from "d3-axis";

  export let innerHeight = 0;
  export let yoffset = 0;
  export let position;
  export let scale;
  export let nticks = 5;

  let transform;
  let g;

  $: {
    select(g).selectAll("*").remove();

    let axis;
    switch (position) {
      case "bottom":
        axis = axisBottom(scale).tickSizeOuter(0).ticks(nticks);
        transform = `translate(0, ${innerHeight})`;
        break;

      case "top":
        axis = axisTop(scale).tickSizeOuter(0).ticks(nticks);
        transform = `translate(0, 0)`;
        break;

      case "left":
        axis = axisLeft(scale).tickSizeOuter(0).ticks(nticks);
        transform = `translate(0, ${yoffset})`;
        break;

      case "right":
        axis = axisRight(scale).tickSizeOuter(0).ticks(nticks);
        transform = `translate(0, ${yoffset})`;
        break;
    }
    select(g).call(axis);
  }
</script>

<g class="axis" bind:this={g} {transform} />
