<script>
  import { onMount } from "svelte";
  import { graphTabs, activeGraphTab, menuModalType } from "../store";
  import { exportSVG } from "../charts/Charttools.svelte";
  import { saveStoreData, loadStoreData } from "../utils/SaveLoadStore.svelte";
  import { graphMap, makeNewChart } from "../charts/allCharts";

  let keepOpen = false;

  function switchTheme(e) {
    if (e.target.checked) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }

  function createMenuItem(displayText, onClick, skip = false) {
    if (skip) {
      return null;
    }
    return { displayText, onClick, visibleState: false };
  }

  function generateChartItems() {
    const thecharts = Object.keys(graphMap).map((chartType) =>
      createMenuItem(chartType, () => makeNewChart(chartType.toString()))
    );
    return thecharts;
  }

  $: menuItems = makeMenu($activeGraphTab);

  function makeMenu(tab) {
    return [
      {
        displayText: "Data",
        items: [
          createMenuItem("Import Data", () => ($menuModalType = "import")),
          createMenuItem("Simulate Data", () => {
            $menuModalType = "generateSim";
          }),
          { displayText: "--hr" },
          createMenuItem("Save session", saveStoreData),
          createMenuItem("Load session", loadStoreData),
        ],
      },
      {
        displayText: "Chart",
        items: [
          {
            displayText: "Insert Chart",
            items: [generateChartItems()],
          },
          createMenuItem(
            "Export <i>" + $graphTabs[tab]?.name + "</i>",
            () => exportSVG(),
            tab < 0
          ),
        ],
      },
      {
        displayText: "Help",
        items: [
          createMenuItem("About", () => {
            $menuModalType = "about";
          }),
        ],
      },
    ];
  }

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
    //create new graph
    makeNewChart("actigram");

    //do click stuff
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
          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
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
            {@html menuItem.displayText}
          </button>
          {#if menuItem.visibleState}
            <ul class="secondmenu dontclose">
              {#each menuItem.items as item}
                {#if item === null}
                  <!-- NOTHING -->
                {:else if item.displayText === "--hr"}
                  <hr />
                {:else if item.items}
                  <!-- Check if there are sub-items -->
                  <li>
                    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                    <button
                      on:mouseover={() => (item.visibleState = true)}
                      on:mouseleave={() =>
                        setTimeout(() => {
                          item.visibleState = false;
                        }, 50)}
                      >{@html item.displayText}
                      <span style="float:right">▶</span></button
                    >
                    {#if item.visibleState || keepOpen}
                      <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                      <ul
                        class="thirdmenu dontclose"
                        on:mouseover={() => {
                          keepOpen = true;
                        }}
                        on:mouseleave={() => {
                          setTimeout(() => (keepOpen = false), 50);
                        }}
                      >
                        {#each item.items[0] as subItem}
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
                    {/if}
                  </li>
                {:else}
                  <li>
                    <button
                      on:click={(e) => {
                        item.onClick();
                        hideAllMenus();
                      }}
                    >
                      {@html item.displayText}
                    </button>
                  </li>
                {/if}
                <!-- null value-->
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
    <input type="checkbox" id="switchtheme" on:change={(e) => switchTheme(e)} />
  </div>
</nav>

<style>
  nav {
    position: sticky;
    height: 2em;
    background-color: var(--bg-color);
    z-index: 1001;
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

  ul li ul.thirdmenu {
    display: flex;
    align-items: stretch;
    flex-direction: column;
    position: absolute; /* with respect to parent */
    box-shadow: 1px 1px 5px #888888;
    margin-left: calc(100% + 1px);
    margin-top: -30px;
  }

  hr {
    border: none;
    border-bottom: 1px solid var(--hover-color);
    margin: 0px 0px;
  }

  #switchtheme {
    float: right;
    margin-right: 10px;
    margin-top: -3em;
  }
  :root {
    --theme-toggle-width: 3rem;
    --theme-toggle-height: 1.5rem;
    --theme-toggle-circle-width: 0;
    --theme-toggle-circle-dimensions: calc(var(--theme-toggle-height) - 0.5rem);
  }
  #switchtheme {
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    cursor: pointer;
    height: var(--theme-toggle-height);
    width: var(--theme-toggle-width);
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
    border: 1px solid var(--hover-color);
    position: relative;
    border-radius: var(--theme-toggle-circle-dimensions);
    padding: 0.2rem;
    background-color: var(--bg-color);
    transition: background-color 0.5s;
  }
  #switchtheme:before {
    content: "";
    width: var(--theme-toggle-circle-dimensions);
    height: var(--theme-toggle-circle-dimensions);
    background-color: var(--primary-color);
    position: absolute;
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%) translateX(0%);
    transition: transform 0.5s;
  }
  #switchtheme:after {
    content: "Light mode";
    white-space: nowrap;
    color: var(--bg-color);
    position: absolute;
    left: calc(100% + 1.5rem);
    font-size: 1.3rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  #switchtheme:checked {
    background-color: var(--primary-color);
    border: none;
  }
  #switchtheme:checked:before {
    background-color: #fff;
    transform: translateY(-50%)
      translateX(calc(var(--theme-toggle-width) - var(--theme-toggle-height)));
  }
  #switchtheme:checked:after {
    content: "Dark mode";
    color: var(--bg-color);
  }
</style>
