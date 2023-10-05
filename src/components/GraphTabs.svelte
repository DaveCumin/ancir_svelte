<script>
  import { graphTabs, graphs, activeGraphTab } from "../store";

  function changeActiveNav(ind) {
    $activeGraphTab = ind;
  }

  function deleteTab(ind) {
    $graphs.splice(ind, 1);
    $graphs = $graphs;
    $graphTabs.splice(ind, 1);
    $graphTabs = $graphTabs;
    $activeGraphTab = $graphs.length > 0 ? 0 : -1;
  }
</script>

{#if $activeGraphTab < 0}
  <p>Need to add a graph</p>
{:else}
  <nav class=''>
    <ul class='flex gap-2 items-center  pb-2'>
      {#each $graphTabs as tabItem, inx}
        <button
          type='button'
          tabindex={inx}
          class="btn btn-neutral flex items-center gap-2 ml-2 {inx === $activeGraphTab ? "bg-gray-700 text-gray-100 " : "bg-gray-100 text-gray-800 hover:bg-gray-200"} "
          on:click={() => (changeActiveNav(inx))}
          on:keydown={(e) => console.log("here " + e)}
        >
           {tabItem.name}
            <button
              type='button'
              tabindex={inx}
              class="delete text-2xl hover:bg-gray-300"
              on:click={() => deleteTab(inx)}
              on:keydown={(e) => console.log("here " + e)}
            >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
              
    </button>
         
          </button>
      {/each}
    </ul>
    <main>
      <slot />
    </main>
  </nav>
{/if}

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
    border-bottom: 1px solid #dee2e6;
  }

  span {
    /* border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer; */
  }

  span:hover {
    /* border-color: #e9ecef #e9ecef #dee2e6; */
  }
  .delete {
    /* position: absolute;
    right: 3px;
    top: 5px;
    color: #a9a9a9;
    float: right;
    margin-top: -3px;
    margin-right: 12px;
    padding: 2px 4px;
    width: 20px;
    height: 20px;
    opacity: 0.6;
    border: 0;
    border-top: 3px solid transparent;
    border-radius: 3px; */
  }
  .delete:hover {
    /* color: red; */
  }

  .tab {
    position: relative;
    padding: 0px 28px 0px 20px;
  }

  .tab.active > span {
    color: #495057;
    background-color: #b8b8b8;
    border-color: #dee2e6 #dee2e6 #fff;
  }
</style>
