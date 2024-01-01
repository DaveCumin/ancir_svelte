<script>
  import { onMount } from "svelte";
  import { menuModalActive, importFileOpen } from "../store";
  import { exportSVG } from "./GraphMaster.svelte";
  import { makeNewChart } from "../components/GraphMaster.svelte";

  function switchTheme(e) {
    if (e.target.checked) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }

  function createMenuItem(displayText, onClick) {
    return { displayText, onClick, visibleState: false };
  }

  let menuItems = [
    {
      displayText: "Data",
      items: [
        createMenuItem("Import Data", () => ($importFileOpen = true)),
        createMenuItem("Simulate Data", () => {
          $menuModalActive = true;
        }),
        { displayText: "--hr" },
        createMenuItem("Exit", () => console.log("Exit")),
      ],
    },
    {
      displayText: "Chart",
      items: [
        {
          displayText: "Insert Chart",
          onClick: () => console.log("here"),
          items: [
            createMenuItem("Raw", () => makeNewChart("raw")),
            createMenuItem("Actigram", () => makeNewChart("actigram")),
          ],
        },
        createMenuItem("Export current chart", () => exportSVG()),
      ],
    },
    {
      displayText: "Help",
      items: [createMenuItem("About", () => console.log("JUST A MENU"))],
    },
  ];

  function hideMenus(currentMenuItem) {
    menuItems.forEach((menuItem) => {
      if (menuItem !== currentMenuItem && menuItem.visibleState) {
        menuItem.visibleState = false;
      }
    });
    menuItems = menuItems;
  }

  function hideAllMenus() {
    menuItems.forEach((menuItem) => {
      menuItem.visibleState = false;
    });
    menuItems = menuItems;
  }

  function changeOpenMenu(currentMenuItem) {
    menuItems.forEach((menuItem) => {
      if (menuItem !== currentMenuItem && menuItem.visibleState) {
        menuItem.visibleState = false;
      } else if (menuItem === currentMenuItem) {
        menuItem.visibleState = true;
      }
    });
    menuItems = menuItems;
  }

  onMount(() => {
    const handleClickOutside = (event) => {
      try {
        if (
          event.srcElement &&
          event.srcElement.className.includes("dontclose")
        ) {
        } else {
          hideAllMenus();
        }
      } catch (error) {
        hideAllMenus();
        //console.log(error)
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener("click", handleClickOutside);
    };
  });
</script>

<nav>
  <div class="applicationmenu">
    <ul class="topmenu">
      {#each menuItems as menuItem}
        <li>
          <button
            class="dontclose"
            on:click={() => {
              menuItem.visibleState = !menuItem.visibleState;
              hideMenus(menuItem);
            }}
            on:mouseover={() => {
              if (menuItems.some((item) => item.visibleState)) {
                changeOpenMenu(menuItem);
              }
            }}
          >
            {menuItem.displayText}
          </button>
          {#if menuItem.visibleState}
            <ul class="secondmenu dontclose">
              {#each menuItem.items as item}
                {#if item.displayText === "--hr"}
                  <hr />
                {:else if item.items}
                  <!-- Check if there are sub-items -->
                  <li>
                    <button>{item.displayText}</button>
                    <ul class="thirdmenu dontclose">
                      {#each item.items as subItem}
                        <li>
                          <button
                            on:click={(e) => {
                              subItem.onClick();
                              hideAllMenus();
                            }}
                          >
                            {subItem.displayText}
                          </button>
                        </li>
                      {/each}
                    </ul>
                  </li>
                {:else}
                  <li>
                    <button
                      on:click={(e) => {
                        item.onClick();
                        hideAllMenus();
                      }}
                    >
                      {item.displayText}
                    </button>
                  </li>
                {/if}
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
      <input
        type="checkbox"
        id="switchtheme"
        on:change={(e) => switchTheme(e)}
      />
    </ul>
  </div>
</nav>

<style>
  nav {
    position: sticky;
    height: 2em;
    background-color: var(--bg-color);
  }
  .applicationmenu {
    border-bottom: 1px var(--hover-color) solid;
    height: 2em;
    z-index: 3;
    padding: 3px;
    position: fixed;
    width: 100%;
    margin: -8px -8px;
  }
  ul {
    padding: 0px;
  }
  ul.topmenu {
    display: flex;
    flex-direction: row;
    margin-top: 0px;
  }
  ul.topmenu li {
    list-style-type: none;
  }
  button {
    border: 0px #000 solid;
    color: var(--font-color);
    height: 30px;
    padding: 0px 10px;
    background: var(--bg-color);
  }
  ul li button:hover {
    background-color: var(--hover-color);
    cursor: pointer;
  }
  ul li ul.secondmenu {
    display: flex;
    align-items: stretch;
    flex-direction: column;
    position: absolute; /* with respect to parent */
    box-shadow: 1px 1px 5px #888888;
  }
  ul li ul.secondmenu li button {
    width: 100%;
    min-width: 150px;
    text-align: left;
  }
  ul li ul.secondmenu li button span.shortcut {
    padding-left: 100px;
    padding-right: 8px;
    float: right;
  }
  ul li button i {
    padding: 0px 20px 0px 8px;
  }

  hr {
    border: none;
    border-bottom: 1px solid var(--hover-color);
    margin: 0px 0px;
  }
</style>
