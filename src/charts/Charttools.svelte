<script context="module">
  // @ts-nocheck

  import { graphTabs, activeGraphTab } from "../store";
  import { get } from "svelte/store";
  import Tooltip from "../utils/Tooltip/Tooltip.svelte";

  //EXPORT AS SVG
  export function exportSVG() {
    if (get(activeGraphTab) < 0) {
      console.log("Nothing to export");
      return;
    }
    const svgString = document
      .getElementById("thePlot")
      .querySelector("svg").outerHTML;
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");
    link.href = svgUrl;
    link.download = get(graphTabs)[get(activeGraphTab)].name + ".svg";
    document.body.appendChild(link);
    link.click();

    URL.revokeObjectURL(svgUrl);
  }

  //Zoom on the SVG
  function Zoom(type = "in") {
    const svg = document.getElementById("svgContainer");
    const scale = parseFloat(
      svg.style.transform.slice(svg.style.transform.indexOf("scale") + 6)
    );

    var newScale = scale;
    if (type === "in") {
      newScale += 0.1;
    } else {
      newScale -= 0.1;
    }

    svg.style.transform = "scale(" + newScale + ")";
    svg.style.width = ""; //auto fill to contents - this takes care of the margin-left and margin-top offsets of the g element
  }
</script>

<div id="chartTools">
  <Tooltip tipcontent="Zoom in">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="button" id="Zoom in" on:click={(e) => Zoom("in")}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 20"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M304 192v32c0 6.6-5.4 12-12 12h-56v56c0 6.6-5.4 12-12 12h-32c-6.6 0-12-5.4-12-12v-56h-56c-6.6 0-12-5.4-12-12v-32c0-6.6 5.4-12 12-12h56v-56c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v56h56c6.6 0 12 5.4 12 12zm201 284.7L476.7 505c-9.4 9.4-24.6 9.4-33.9 0L343 405.3c-4.5-4.5-7-10.6-7-17V372c-35.3 27.6-79.7 44-128 44C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208c0 48.3-16.4 92.7-44 128h16.3c6.4 0 12.5 2.5 17 7l99.7 99.7c9.3 9.4 9.3 24.6 0 34zM344 208c0-75.2-60.8-136-136-136S72 132.8 72 208s60.8 136 136 136 136-60.8 136-136z"
          style="
    transform: scale(0.04); fill: var(--font-color);
"
        ></path>
      </svg>
    </div>
  </Tooltip>

  <Tooltip tipcontent="Zoom out">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="button" id="Zoom in" on:click={() => Zoom("out")}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 20"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M304 192v32c0 6.6-5.4 12-12 12H124c-6.6 0-12-5.4-12-12v-32c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12zm201 284.7L476.7 505c-9.4 9.4-24.6 9.4-33.9 0L343 405.3c-4.5-4.5-7-10.6-7-17V372c-35.3 27.6-79.7 44-128 44C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208c0 48.3-16.4 92.7-44 128h16.3c6.4 0 12.5 2.5 17 7l99.7 99.7c9.3 9.4 9.3 24.6 0 34zM344 208c0-75.2-60.8-136-136-136S72 132.8 72 208s60.8 136 136 136 136-60.8 136-136z"
          style="
  transform: scale(0.04); fill: var(--font-color);
"
        ></path>
      </svg>
    </div>
  </Tooltip>

  <Tooltip tipcontent="Save plot">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="button" id="export" on:click={() => exportSVG()}>💾</div>
  </Tooltip>
</div>

<style>
  #chartTools {
    margin-top: -10px;
    background-color: var(--hover-color);
    -webkit-backdrop-filter: blur(1px);
    backdrop-filter: blur(1px);
    opacity: 0.4;
    position: absolute;
    margin-left: calc(100% - 10em);
    border-radius: 5px;
    display: flex;
  }
  .button {
    margin: 5px;
    border: none;
    border-radius: 20%;
    padding: 0.2em 0.5em;
    opacity: 1;
    cursor: pointer;
    width: 20px;
    height: 20px;
  }
  .button:hover {
    background: var(--hover-color);
  }
  #chartTools:hover {
    opacity: 1;
    background: var(--bg-color);
  }
</style>
