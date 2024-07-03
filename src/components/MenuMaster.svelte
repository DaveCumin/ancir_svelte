<script>
  // @ts-nocheck
  import { onMount } from "svelte";
  import { graphs, graphTabs, activeGraphTab, menuModalType } from "../store";
  import { saveStoreData, loadStoreData } from "../utils/SaveLoadStore.svelte";
  import {
    graphMap,
    makeNewChart,
    getRandomHexColour,
    graphFilesLoaded,
  } from "../charts/AllCharts.js";
  import { exportSVG } from "../utils/exportSVG";
  import { changeStyle } from "./Styling.svelte";
  import ThemeChanger from "./ThemeChanger.svelte";

  // MenuMaster code
  let keepOpen = false;

  function switchTheme(e) {
    if (e.target.checked) {
      changeStyle("dark");
    } else {
      changeStyle("light");
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
          createMenuItem("Style", () => {
            $menuModalType = "styling";
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

  //----------------------------
  //For the first graph
  import { addDataToGraph } from "../data/handleData";
  //----------------------------

  onMount(async () => {
    // Wait for graph files to be loaded
    await graphFilesLoaded;

    //----------------------------
    //make actigram
    makeNewChart("Actigram");
    addDataToGraph(
      0,
      { time: "time", values: "values" },
      {
        col: { hex: getRandomHexColour(), alpha: 0.5 },
        onsets: [
          {
            type: "onset",
            showOnsets: true,
            filterStart: 1,
            filterEnd: 28,
            centileThresh: 80,
            M: 3,
            N: 3,
            lmFit: { slope: 0, intercept: 0, rSquared: 0 },
            col: { hex: getRandomHexColour(), alpha: 0.5 },
            showLine: true,
          },
        ],
      }
    );

    //create new graph
    makeNewChart("Raw");
    addDataToGraph(
      0,
      { x: "any", y: "any" },
      {
        col: { hex: getRandomHexColour(), alpha: 0.5 },
        size: 2,
        strokeWidth: 1,
        strokeCol: { hex: getRandomHexColour(), alpha: 0.9 },
      }
    );

    makeNewChart("Periodogram");
    addDataToGraph(
      0,
      { time: "any", values: "any" },
      {
        col: { hex: getRandomHexColour(), alpha: 0.5 },
      }
    );

    $activeGraphTab = 0;
    //----------------------------

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
    <ThemeChanger />
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
</style>
