<script>
  // @ts-nocheck
  import { onMount } from "svelte";

  import GenerateSimulated from "../data/GenerateSimulated.svelte";

  import { menuModalActive, selectedTheme } from "../store";

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
    if (itemLabel === "Simulate Data") {
      $menuModalActive = true;
    }
  }

  let activeMenuItem = "";

  function setActiveMenuItem(menuItem) {
    activeMenuItem = menuItem;
  }

  onMount(() => {
    document.getElementById("menu-bar").addEventListener("click", (event) => {
      const menuBar = document.querySelector("#menu-bar");
      if (!menuBar.contains(event.target)) {
        setActiveMenuItem("");
      }
    });
  });

   const themes = [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
    ]

    
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
<div class="flex items-center">
  
  <nav class="mx-2" id="menu-bar">
    <ul class="flex ">
      {#each menuItems as item (item.label)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li
          class="pr-4 cursor-pointer"
          on:click={() => setActiveMenuItem(item.label)}
        >
          {item.label}
          {#if activeMenuItem === item.label}
            <ul
              class="none absolute t-0 l-0 p-2 mt-2 min-w-[100px] cursor-pointer rounded shadow-lg bg-cyan-500 text-white text-sm z-[1000]"
            >
              {#each item.subMenu as subItem (subItem.label)}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <li class="py-2" on:click={() => handleItemClick(subItem.label)}>
                  {subItem.label}
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
  
  </nav>
<div class=flex>

  <select class='inline-flex select  select-xs h-9  focus:outline-none w-24  bg-base-100 '    
  bind:value={$selectedTheme}>
       {#each themes as theme}
         <option value={theme} 
           >{theme}</option
         >
       {/each}
     </select>
</div>
</div>


 <GenerateSimulated />
<!-- {#if $menuModalActive}
  <div class="modal-container">
    <div class="modal">
      <GenerateSimulated />
      <button on:click={closeModal}>Close</button>
    </div>
  </div>
{/if} -->
