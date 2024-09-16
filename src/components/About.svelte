<script>
  import { menuModalType } from "../store";
  import Dialog from "./Dialog.svelte";
</script>

{#if $menuModalType === "about"}
  <Dialog title="ABOUT AnCiR">
    <h3>Analysis of Circadian Rhythms (AnCiR)</h3>

    <p>
      This is our 'AnCiR' to the need for a simple-to-use (GUI; no coding) tool
      for analysis of circadian rhythms. Currently, the tool only allows for
      import of csv data and plotting of actograms.
    </p>

    <p>
      This is written in Svelte, using D3, with help from <a
        href="https://github.com/korur">@korur</a
      >
      and <a href="https://github.com/khromov">@khromov</a> - thank you!
    </p>

    <h4>For users</h4>

    <p>
      If you want to generate sample data, just click on _Data_>_Create_ and a
      new Sample set should appear. Similarly, if you have your own .csv file,
      then you can import it and it should show up in the list.
    </p>

    <p>
      Clicking on the icon next to the name of data table should display the
      contents in the bottom viewer, so you can see what the data look like.
    </p>

    <p>
      To create an actogram, click on _Plot_>_Actogram_. You can change the data
      that is used by using the dropdown lists under _Data for this plot_ on the
      right hand panel. You can add multiple data sources and change their
      colours.
    </p>

    <p>The other controls for the actogram should be self-explanatory.</p>

    <p>
      The Periodogram plot is what it says it is, and raw is just a plot of the
      data - with similar controls to the actogram.
    </p>

    <p>Have fun.</p>

    <h4>For developers</h4>

    <p>
      Any advice or offers of support will be welcommed - email <a
        href="mailto:d.cumin@auckland.ac.nz?subject=AnCiR"
        >d.cumin@auckland.ac.nz</a
      >
    </p>

    The following packages code was used in this project:
    <ul>
      <li>
        <a href="https://svelte.dev/">Svelte</a> is used as the framework/library/compiler
        of the code.
      </li>
      <li>
        <a href="https://d3js.org/">D3</a> is used for plotting.
      </li>
      <li>
        <a href="https://www.papaparse.com/">Papaparse</a> is used for importing
        the data.
      </li>
      <li>
        <a
          href="https://svelte.dev/repl/79d35c3691cf4ed0924e7e98dc9af55e?version=4.2.8"
          >In-place editing</a
        > for updating items.
      </li>
      <li>
        <a href="https://www.npmjs.com/package/moment-guess">Moment-guess</a>
        was adapted to guess the time format of data.
      </li>
      <li>
        <a href="https://atomiks.github.io/tippyjs/">Tippy</a> was used in this project.
      </li>
      <li>
        <a
          href="https://github.com/ytliu0/p-value_calculators/blob/master/statFunctions.js"
          >Stats functions from</a
        > @ytliu0.
      </li>
      <li>
        <a href="https://github.com/EmilTholin/svelte-spinner/">Spinner</a> was taken
        to use for the spinner.
      </li>
      <li>
        <a href="https://www.npmjs.com/package/luxon">Luxon</a> is used for date
        manipulation and caluclations.
      </li>
    </ul>
  </Dialog>
{/if}
