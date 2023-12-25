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

<div id="graphTabs" style="margin: 0 1em;">
  {#if $activeGraphTab < 0}
    <h3>Need to add a graph</h3>
  {:else}
    <nav>
      <ul>
        {#each $graphTabs as tabItem, inx}
          <li class={$activeGraphTab === inx ? "active" : ""}>
            <span class="tabname" on:click={() => changeActiveNav(inx)}>
              {tabItem.name}
            </span>
            <button class="closeButton" on:click={() => deleteTab(inx)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
</div>

<style>
  #graphTabs {
    position: sticky;
    top: 0px;
    left: 0px;
    z-index: 999;
    background: white;
    padding: 0px;
    margin: 0 2.2em 0 0 !important;
  }

  nav {
    margin: 0;
    background-color: #fff;
    z-index: 9;
    width: calc(100% + 2.2em);
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    border-bottom: 3px solid #eee;
    margin-left: -2em;
    margin-top: 2px;
  }
  li {
    margin-bottom: -3px;
    margin-right: 2px;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    background: #eee;
  }

  span {
    border: 3px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  span:hover,
  span:hover + button {
    border-color: #eee #eee white;
    background: white;
  }

  li.active > span,
  li.active > button {
    border-color: #eee #eee #fff;
    background: white;
  }
  li.active:hover > span {
    cursor: default;
    background: white;
  }
  li.active:hover > button {
    background: white;
  }
  .closeButton {
    width: 15px;
    cursor: pointer;
    padding: 0;
    float: right;
    margin-right: 3px;
    margin-top: -33px;
    border: none;
    background: #eee;
  }
  .closeButton:hover {
    color: red;
    background: #eee;
  }
</style>
