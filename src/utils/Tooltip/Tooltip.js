import Tooltip from "./TooltipFromUse.svelte";

export function tooltip(element) {
  let tipcontent;
  let tooltipComponent;

  function mouseOver(event) {
    // NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
    // remember to set it back on `mouseleave`
    tipcontent = element.getAttribute("tipcontent");
    element.removeAttribute("title");

    tooltipComponent = new Tooltip({
      props: {
        tipcontent: tipcontent,
        x: event.pageX,
        y: event.pageY,
      },
      target: document.body,
    });
  }
  function mouseMove(event) {
    tooltipComponent.$set({
      x: event.pageX,
      y: event.pageY,
    });
  }
  function mouseLeave() {
    tooltipComponent.$destroy();
    element.setAttribute("tipcontent", tipcontent);
  }

  element.addEventListener("mouseover", mouseOver);
  element.addEventListener("mouseleave", mouseLeave);
  element.addEventListener("mousemove", mouseMove);

  return {
    destroy() {
      element.removeEventListener("mouseover", mouseOver);
      element.removeEventListener("mouseleave", mouseLeave);
      element.removeEventListener("mousemove", mouseMove);
    },
  };
}
