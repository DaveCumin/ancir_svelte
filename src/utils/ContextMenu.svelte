<script>
  import { contextMenu } from "../store";

  // pos is cursor position when right click occur
  let pos = { x: 0, y: 0 };
  // menu is dimension (height and width) of context menu
  let menu = { h: 100, w: 76 };
  // browser/window dimension (height and width)
  let browser = { h: 0, w: 0 };
  let showMenu;

  export function rightClickContextMenu(e) {
    e.stopPropagation();
    browser = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    pos = {
      x: e.clientX,
      y: e.clientY,
    };
    // If part of context menu will be outside window,
    // then change the position of the context menu.
    if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
    if (browser.w - pos.x < menu.w) pos.x = pos.x - menu.w;

    showMenu = true;
  }

  function onPageClick(e) {
    // To make context menu disappear when
    // mouse is clicked outside context menu

    try {
      if (e.srcElement.className.includes("showContextMenu")) {
        rightClickContextMenu(e);
      } else {
        showMenu = false;
      }
    } catch (error) {
      showMenu = false;
      //console.log(error);
    }
  }

  function getContextMenuDimension(node) {
    // This function will get context menu dimension
    // when navigation is shown => showMenu = true
    let height = node.offsetHeight;
    let width = node.offsetWidth;
    menu = {
      h: height,
      w: width,
    };
  }
</script>

{#if showMenu}
  <nav
    use:getContextMenuDimension
    style="position: absolute; top:{pos.y}px; left:{pos.x}px; z-index:999;"
  >
    <div class="navbar" id="navbar">
      <ul>
        {#each $contextMenu.labels as label, cmIndex}
          <li>
            <button
              on:click={(e) => {
                $contextMenu.funcs[cmIndex]();
                showMenu = false;
              }}>{label}</button
            >
          </li>
        {/each}
      </ul>
    </div>
  </nav>
{/if}

<svelte:window on:click={onPageClick} />

<style>
  .navbar {
    display: inline-flex;
    border: 1px #999 solid;
    width: fit-content;
    background-color: var(--bg-color);
    border-radius: 5px;
    overflow: hidden;
    flex-direction: column;
  }
  .navbar ul {
    margin: 6px;
  }
  ul {
    padding: 0px;
  }
  ul li {
    display: block;
    list-style-type: none;
    width: 1fr;
  }
  ul li button {
    font-size: 0.75rem;
    width: 100%;
    height: 30px;
    text-align: left;
    border: 0px;
    background-color: var(--bg-color);
  }
  ul li button:hover {
    color: var(--bg-color);
    text-align: left;
    border-radius: 5px;
    background-color: #eee;
  }
  ul li button i {
    padding: 0px 15px 0px 10px;
  }
  hr {
    border: none;
    border-bottom: 1px solid #ccc;
    margin: 5px 0px;
  }
</style>
