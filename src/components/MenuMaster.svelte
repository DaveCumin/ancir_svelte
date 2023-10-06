<script>
  // @ts-nocheck
  import GenerateSimulated from "../data/GenerateSimulated.svelte";

  import { menuModalActive } from "../store";

  import { createEventDispatcher } from "svelte"; // Import createEventDispatcher
  const dispatch = createEventDispatcher();

  function closeModal() {
    $menuModalActive = false;
    // Emit the 'close' event when the modal is closed
    dispatch("close");
  }

  function handleItemClick(itemLabel) {
    // You can perform any actions you want here
    console.log(`Clicked on "${itemLabel}"`);
    activeMenuItem = "";
    if (itemLabel == "Simulate Data") {
      $menuModalActive = true;
    }
  }

  let activeMenuItem = "";

  function setActiveMenuItem(menuItem) {
    activeMenuItem = menuItem;
  }

  document.addEventListener("click", (event) => {
    const menuBar = document.querySelector(".menu-bar");
    if (!menuBar.contains(event.target)) {
      setActiveMenuItem("");
    }
  });

  // Define your menu items as an array of objects
  const menuItems = [
    {
      label: "File",
      subMenu: [
        {
          label: "Import Data",
        },
        {
          label: "Simulate Data",
        },
      ],
    },
    {
      label: "Plot",
      subMenu: [
        {
          label: "Raw",
        },
        {
          label: "Actigram",
        },
      ],
    },
    {
      label: "About",
      subMenu: [
        {
          label: "About Us",
        },
      ],
    },
  ];
</script>

<nav class="menu-bar">
  <ul>
    {#each menuItems as item (item.label)}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <li class="menu-item" on:click={() => setActiveMenuItem(item.label)}>
        {item.label}
        {#if activeMenuItem === item.label}
          <ul class="sub-menu">
            {#each item.subMenu as subItem (subItem.label)}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
              <li on:click={() => handleItemClick(subItem.label)}>
                {subItem.label}
              </li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

{#if $menuModalActive}
  <div class="modal-container">
    <div class="modal">
      <GenerateSimulated />
      <button on:click={closeModal}>Close</button>
    </div>
  </div>
{/if}

<style>
  /* Style your menu bar here */
  .menu-bar ul {
    list-style-type: none;
    padding: 0;
    display: flex;
  }

  .menu-bar li {
    cursor: pointer;
    margin-right: 20px; /* Add spacing between menu items */
    position: relative; /* Relative positioning for sub-menu */
  }

  .menu-item:hover .sub-menu {
    display: block; /* Show sub-menu on hover */
  }

  .sub-menu {
    display: none;
    position: absolute;
    top: 100%; /* Position below the parent menu item */
    left: 0;
    background-color: #fff; /* Background color for sub-menu */
    border: 1px solid #ccc; /* Border for sub-menu */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Box shadow for sub-menu */
    list-style-type: none;
    padding: 0;
  }

  .sub-menu li {
    padding: 10px;
  }

  /* Style your modal container and backdrop here */
  .modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    padding: 20px;
    z-index: 1000;
  }
</style>
