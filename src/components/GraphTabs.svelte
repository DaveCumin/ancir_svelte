<script>
  import Charttools from "../charts/Charttools.svelte";
  import { graphTabs, graphs, activeGraphTab } from "../store";
  import InPlaceEdit from "../utils/InPlaceEdit.svelte";

  function changeActiveNav(ind) {
    $activeGraphTab = ind;
  }

  //TOFIX: There is an issue when the last tab is deleted: the components in GraphMaster try to update first and cannot find data.
  function deleteTab(ind) {
    $graphs.splice(ind, 1);
    $graphTabs.splice(ind, 1);

    $activeGraphTab = $graphs.length - 1;

    console.log($activeGraphTab);

    $graphs = $graphs;
    $graphTabs = $graphTabs;
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
              <InPlaceEdit bind:value={tabItem.name} />
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
    <Charttools />
  {/if}
</div>

<style>
  #graphTabs {
    position: sticky;
    top: 0px;
    left: 0px;
    z-index: 999;
    background: var(--bg-color);
    padding: 0px;
    margin: 0 !important;
    display: flow-root;
    /*box-shadow: 1px 2px 5px var(--hover-color);*/
  }

  nav {
    margin: 0;
    background-color: var(--bg-color);
    z-index: 9;
    width: 100%;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    border-bottom: 3px solid var(--hover-color);
    margin-left: -2em;
    margin-top: 2px;
  }
  li {
    margin-bottom: -3px;
    margin-right: 2px;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    background: var(--hover-color);
  }

  span {
    border: 3px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  li.active > span,
  li.active > .closeButton,
  li.active:hover > span {
    border-color: var(--hover-color) var(--hover-color) var(--bg-color);
    background: var(--bg-color);
  }

  li:hover,
  li:hover > span,
  li:hover > .closeButton {
    border-color: var(--hover-color) var(--hover-color) var(--hover-color);
    background: var(--bg-color);
  }

  li.active:hover > span,
  li.active:hover > .closeButton {
    cursor: default;
    background: var(--bg-color);
  }

  .closeButton {
    width: 15px;
    cursor: pointer;
    padding: 0;
    float: right;
    margin-right: 3px;
    margin-top: -32px;
    border: none;
    background-color: var(--hover-color);
  }
  svg:hover {
    stroke: red;
  }
</style>
