<script>
  import { menuModalType } from "../store";
  import Dialog from "./Dialog.svelte";
</script>

{#if $menuModalType === "about"}
  <Dialog title="ABOUT">
    <h3>Analysis of Circadian Rhythms (AnCir)</h3>

    <p>
      This is our 'AnCir' to the need for a simple-to-use (GUI; no coding) tool
      for analysis of circadian rhythms. Currently, the tool only allows for
      import of csv data and plotting of actigrams.
    </p>

    <p>
      This is written in Svelte, with help from @korur and @khromov - thank you!
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
  </Dialog>
{/if}
