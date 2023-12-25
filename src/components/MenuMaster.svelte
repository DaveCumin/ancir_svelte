<script>
  import { onMount } from "svelte";

  function createMenuItem(displayText, onClick) {
    return { displayText, onClick, visibleState: false };
  }

  let menuItems = [
    {
      displayText: "Data",
      items: [
        createMenuItem("Import Data", () => console.log("Import...")),
        createMenuItem("Simulate Data", () => console.log("Simulate Data")),
        { displayText: "--hr" },
        createMenuItem("Exit", () => console.log("Exit")),
      ],
    },
    {
      displayText: "Edit",
      items: [
        createMenuItem("Insert", () => console.log("Insert...")),
        createMenuItem("Copy", () => console.log("Copy...")),
        createMenuItem("Paste", () => console.log("Paste...")),
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
    </ul>
  </div>
</nav>

<style>
  nav {
    position: sticky;
    height: 2em;
  }
  .applicationmenu {
    border: 1px #eee solid;
    background-color: #fff;
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
    color: #222;
    height: 30px;
    background-color: #fff;
    padding: 0px 10px;
  }
  ul li button:hover {
    background-color: #eee;
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
    border-bottom: 1px solid #ccc;
    margin: 0px 0px;
  }
</style>
