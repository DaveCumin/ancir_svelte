<!-- from https://svelte.dev/repl/79d35c3691cf4ed0924e7e98dc9af55e?version=4.2.8 -->
<script>
  // @ts-nocheck

  import { createEventDispatcher, onMount, afterUpdate } from "svelte";

  export let value,
    required = true;

  const dispatch = createEventDispatcher();
  let editing = false,
    original;
  let inputElement; // Reference to the input element

  onMount(() => {
    original = value;
  });

  afterUpdate(() => {
    // Set focus on the input element when editing starts
    if (editing) {
      inputElement.focus();
      inputElement.click();
    }
  });

  function edit(e) {
    editing = true;
  }

  function submit() {
    if (value != original && containsNonSpaceCharacter(value)) {
      dispatch("submit", value);
    } else {
      value = original;
    }

    editing = false;
  }

  function keydown(event) {
    if (event.key == "Escape") {
      event.preventDefault();
      value = original;
      editing = false;
    }
  }

  // Regular expression to check if there is any non-space character
  function containsNonSpaceCharacter(text) {
    const nonSpaceRegex = /\S/;

    return nonSpaceRegex.test(text);
  }
</script>

{#if editing}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <form on:submit|preventDefault={submit} on:keydown={keydown}>
    <input
      bind:value
      on:blur={submit}
      {required}
      bind:this={inputElement}
      class={editing ? "editing" : ""}
    />
  </form>
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span
    on:dblclick={(e) => {
      edit();
    }}
    on:click={(e) => {
      //don't change the click behaviour for the tabs
      if (!e.target.parentElement.className.includes("tabname")) {
        e.preventDefault();
      }
    }}
  >
    {value}
  </span>
{/if}

<style>
  span {
    cursor: context-menu;
  }
  form {
    display: inline;
  }

  input {
    display: inherit;
    border: none;
    background: inherit;
    background-color: inherit;
    font-size: inherit;
    color: inherit;
    font-weight: inherit;
    text-align: inherit;
    box-shadow: none;
  }
  .editing {
    font-style: italic;
  }
</style>
