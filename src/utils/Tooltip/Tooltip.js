import Tooltip from "./Tooltip.svelte";

export function tooltip(element) {
  let div;
  let title;
  let tooltipComponent;
  let xval;
  let yval;

  function mouseOver(event) {
    // NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
    // remember to set it back on `mouseleave`
    title = element.getAttribute("title");
    element.removeAttribute("title");

    xval = element.getAttribute("cx");
    yval = element.getAttribute("cy");

    tooltipComponent = new Tooltip({
      props: {
        title: title,
        x: event.clientX,
        y: event.clientY,
        xval,
        yval,
      },
      target: document.body,
    });
  }

  function mouseMove(event) {
    tooltipComponent.$set({
      props: {
        x: event.clientX,
        y: event.clientY,
      },
    });
  }

  function mouseClick() {
    tooltipComponent.$destroy();
    // NOTE: restore the `title` attribute
    element.setAttribute("title", title);
  }

  function mouseLeave() {
    tooltipComponent.$destroy();
    // NOTE: restore the `title` attribute
    element.setAttribute("title", title);
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
