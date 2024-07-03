<script>
  //This was adapted from https://codepen.io/matheusreina/pen/YzdpboE?editors=1111
  import { changeStyle } from "./Styling.svelte";
  import { onMount } from "svelte";

  onMount(() => {
    changeStyle("light");
  });
</script>

<div class="flex-box">
  <div class="tw-toggle">
    <input
      checked
      type="radio"
      name="toggle"
      value="light"
      on:change={() => changeStyle("light")}
    />
    <label class="toggle toggle-yes">
      <div class="inside"></div>
    </label>
    <input
      type="radio"
      name="toggle"
      value="user"
      on:change={() => changeStyle("user")}
    />
    <label class="toggle toggle-yes">
      <div class="inside"></div>
    </label>
    <input
      type="radio"
      name="toggle"
      value="dark"
      on:change={() => changeStyle("dark")}
    />
    <label class="toggle toggle-yes">
      <div class="inside"></div>
    </label>
    <span></span>
  </div>
</div>

<style>
  .tw-toggle {
    float: right;
    margin-right: 10px;
    margin-top: -3em;
    background: var(--bg-color);
    display: inline-block;
    padding: 1px 3px;
    border-radius: 20px;
    position: relative;
    border: 2px solid var(--primary-color);
    cursor: pointer;
  }

  .tw-toggle label {
    display: inline-block;
    position: relative;
    z-index: 2;
    margin: 0;
    padding: 2px 3px;
    cursor: pointer;
  }

  .tw-toggle input {
    /* display: none; */
    position: absolute;
    z-index: 3;
    opacity: 0;
    cursor: pointer;
  }

  .tw-toggle span {
    height: 15px;
    width: 15px;
    line-height: 20px;
    border-radius: 50%;
    background: var(--bg-color);
    display: block;
    position: absolute;
    left: 22px;
    top: 2px;
    transition: all 0.3s ease-in-out;
  }

  .tw-toggle input[value="light"]:checked ~ span {
    background: var(--primary-color);
    left: 2px;
    color: var(--primary-color);
  }

  .tw-toggle input[value="dark"]:checked ~ span {
    background: var(--primary-color);
    left: 46px;
  }
  .tw-toggle input[value="user"]:checked ~ span {
    background: var(--primary-color);
    left: 23px;
  }
  .inside {
    width: 10px;
  }
</style>
