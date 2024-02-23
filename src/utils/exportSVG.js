import { get } from "svelte/store";
import { graphTabs, activeGraphTab } from "../store";

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
