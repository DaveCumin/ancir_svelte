<script context="module">
  import { graphTabs, activeGraphTab } from "../store";
  import { get } from "svelte/store";
  import { tooltip } from "../utils/Tooltip/Tooltip";

  //EXPORT AS SVG
  export function exportSVG() {
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
</script>

<div id="chartTools">
  <div
    class="button"
    tipcontent="Save plot"
    use:tooltip
    id="export"
    on:click={(e) => exportSVG()}
  >
    💾
  </div>
</div>

<style>
  #chartTools {
    margin-top: -10px;
    background: var(--bg-color);
    -webkit-backdrop-filter: blur(1px);
    backdrop-filter: blur(1px);
    opacity: 0.8;
    position: absolute;
    margin-left: calc(100% - 4em);
    border-radius: 5px;
  }
  .button {
    background: var(--bg-color);
    margin: 5px;
    border: none;
    border-radius: 20%;
    padding: 0.2em 0.5em;
    opacity: 1;
    cursor: pointer;
  }
  .button:hover {
    background: var(--hover-color);
  }
  #chartTools:hover {
    opacity: 1;
  }
</style>
