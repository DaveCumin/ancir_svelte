<script>
  // @ts-nocheck
  import { select, selectAll } from "d3-selection";
  import { axisBottom, axisLeft, axisTop, axisRight } from "d3-axis";

  export let innerHeight = 0;
  export let width = 0; // only needed for "right" - could be subsumed into xoffset
  export let yoffset = 0;
  export let xoffset = 0;
  export let position = "left";
  export let scale;
  export let nticks = 5;
  export let colour = "";

  let transform;
  let g;

  $: {
    select(g).selectAll("*").remove();

    if (colour === "") {
      colour = getComputedStyle(document.documentElement).getPropertyValue(
        "--font-color"
      );
    }

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
        transform = `translate(${xoffset}, ${yoffset})`;
        break;

      case "right":
        axis = axisRight(scale).tickSizeOuter(0).ticks(nticks);
        transform = `translate(${xoffset + width}, ${yoffset})`;
        break;
    }
    select(g).call(axis).selectAll("path").style("stroke", colour);
    select(g).call(axis).selectAll("text").style("fill", colour);
  }
</script>

<g class="axis" bind:this={g} {transform} />
