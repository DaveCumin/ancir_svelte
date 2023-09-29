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
  <nav>
    <ul>
      {#each $graphTabs as tabItem, inx}
        <div
          role="button"
          tabindex={inx}
          class={inx === $activeGraphTab ? "tab active" : "tab"}
          on:click={() => changeActiveNav(inx)}
          on:keydown={(e) => console.log("here " + e)}
        >
          <span
            >{tabItem.name}
            <div
              role="button"
              tabindex={inx}
              class="delete"
              on:click={() => deleteTab(inx)}
              on:keydown={(e) => console.log("here " + e)}
            >
              x
            </div></span
          >
        </div>
      {/each}
    </ul>
    <main>
      {$graphs[$activeGraphTab].graph}
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
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  span:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
  }
  .delete {
    position: absolute;
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
    border-radius: 3px;
  }
  .delete:hover {
    color: red;
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
