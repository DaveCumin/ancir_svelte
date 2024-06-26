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
      import of csv data and plotting of actigrams.
    </p>

    <p>
      This is written in Svelte, using D3, with help from <a
        href="https://github.com/korur">@korur</a
      >
      and <a href="https://github.com/khromov">@khromov</a> - thank you!
    </p>

    <h4>For users</h4>

    <p>
      AnCiR should start with some sample data already in the <strong
        >Data</strong
      > section on the left hand side. If you want to generate more sample data,
      just click on _Data_>_Create_ and a new Sample set should appear. Similarly,
      if you have your own .csv file, then you can import it and it should show up
      in the list.
    </p>

    <p>
      Clicking on the name of the data table should display the contents in the
      bottom viewer, so you can see what the data look like.
    </p>

    <p>
      To create an actigram, click on _Plot_>_Actigram_. You can change the data
      that is used by using the dropdown lists under _Data for this plot_ on the
      right hand panel. You can add multiple data sources and change their
      colours. To see the post-processed data useed in the plot, click on the
      hyperlinked data for each source and see it appear in the data tabs below.
    </p>

    <p>The other controls for the actigram should be self-explanatory.</p>

    <p>
      The Periodogram plot is what it says it is, and raw is just a plot of the
      data - with similar controls to the actigram.
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
        <a
          href="https://svelte.dev/repl/dd6754a2ad0547c5b1c1ea37c0293fef?version=4.2.10"
          >Tooltip</a
        > was adapted for this project.
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
