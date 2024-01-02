import Tooltip from "./Tooltip.svelte";

export function tooltip(element) {
  let tooltipComponent;
  let tipcontent = element.getAttribute("tipcontent");

  function mouseOver(event) {
    tooltipComponent = new Tooltip({
      props: {
        tipcontent: tipcontent,
        x: event.clientX,
        y: event.clientY,
      },
      target: document.body,
    });
  }

  function mouseMove(event) {
    tooltipComponent.$set({
      props: {
        tipcontent,
      },
    });
  }

  function mouseClick() {
    tooltipComponent.$destroy();
  }

  function mouseLeave() {
    tooltipComponent.$destroy();
  }

  element.addEventListener("mouseover", mouseOver);
  element.addEventListener("mouseleave", mouseLeave);
  element.addEventListener("mousemove", mouseMove);
  element.addEventListener("click", mouseClick);

  return {
    destroy() {
      element.removeEventListener("mouseover", mouseOver);
      element.removeEventListener("mouseleave", mouseLeave);
      element.removeEventListener("mousemove", mouseMove);
      element.addEventListener("click", mouseClick);
    },
  };
}
