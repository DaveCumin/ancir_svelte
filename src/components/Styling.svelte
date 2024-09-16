<script context="module">
  import { menuModalType, selectedTheme, userStyle } from "../store";
  import { get } from "svelte/store";
  import Dialog from "./Dialog.svelte";

  ///Predefined Styles
  const lightStyles = {
    "--bg-color": "#fff",
    "--font-color": "#424242",
    "--hover-color": "#eee",

    "--primary-color": "lightblue",
    "--secondary-color": "#888888",
  };
  const darkStyles = {
    "--bg-color": "#161625",
    "--font-color": "#e1e1ff",
    "--hover-color": "#888888",

    "--primary-color": "#9a97f3",
    "--secondary-color": "#888888",
  };

  export function changeStyle(type) {
    console.log("changing " + type);
    if (type == "light") {
      selectedTheme.update((currentData) => (currentData = "light"));
      Object.entries(lightStyles).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
    if (type == "dark") {
      selectedTheme.update((currentData) => (currentData = "dark"));
      Object.entries(darkStyles).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
    if (type == "user") {
      selectedTheme.update((currentData) => (currentData = "user"));
      Object.entries(userStyle).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }
</script>

{#if $menuModalType === "styling"}
  <Dialog title="Change colours">
    <label>Background color</label><input
      style="padding:0"
      type="color"
      bind:value={userStyle["--bg-color"]}
      on:input={() => changeStyle(get(selectedTheme))}
    />
    <br />
    <label>Font color</label><input
      style="padding:0"
      type="color"
      bind:value={userStyle["--font-color"]}
      on:input={() => changeStyle(get(selectedTheme))}
    />
    <br />
    <label>Hover color</label><input
      style="padding:0"
      type="color"
      bind:value={userStyle["--hover-color"]}
      on:input={() => changeStyle(get(selectedTheme))}
    />
    <br />
    <label>Primary color</label><input
      style="padding:0"
      type="color"
      bind:value={userStyle["--primary-color"]}
      on:input={() => changeStyle(get(selectedTheme))}
    />
    <br />
    <label>Secondary color</label><input
      style="padding:0"
      type="color"
      bind:value={userStyle["--secondary-color"]}
      on:input={() => changeStyle(get(selectedTheme))}
    />
  </Dialog>
{/if}
