# Analysis of Circadian Rhythms (AnCir)

This is our 'AnCir' to the need for a simple-to-use (GUI; no coding) tool for analysis of circadian rhythms. Currently, the tool only allows for import of csv data and plotting of actograms.

This has been rewritten in Svelte (see previous incarnation at https://github.com/DaveCumin/ancir) to make it more extensible, faster, and fix a bunch of bugs. With help from @korur and @khromov - thank you!

## For users

AnCiR should start with some sample data already in the **Data** section on the left hand side. If you want to generate more sample data, just click on _Data_>_Create_ and a new Sample set should appear. Similarly, if you have your own .csv file, then you can import it and it should show up in the list.

Clicking on the name of the data table should display the contents in the bottom viewer, so you can see what the data look like

To create an actogram, click on _Plot_>_Actogram_. You can change the data that is used by using the dropdown lists under _Data for this plot_ on the right hand panel. You can add multiple data sources and change their colours. To see the post-processed data useed in the plot, click on the hyperlinked data for each source and see it appear in the data tabs below.

The other controls for the actogram should be self-explanatory.

The Periodogram plot is what it says it is, and raw is just a plot of the data - with similar controls to the actogram.

Have fun.

## For developers

Any advice or offers of support will be welcommed - email d.cumin@auckland.ac.nz.

The following packages code was used in this project:

- [Svelte](https://svelte.dev/) is used as the framework/library/compiler of the code.
- [D3](https://d3js.org/) is used for plotting.
- [Papaparse](https://www.papaparse.com/) is used for importing the data.
- [In-place editing](https://svelte.dev/repl/79d35c3691cf4ed0924e7e98dc9af55e?version=4.2.8) is used for updating items.
- [Moment-guess](https://www.npmjs.com/package/moment-guess) was adapted to guess the time format of data.
- [Tooltip](https://svelte.dev/repl/dd6754a2ad0547c5b1c1ea37c0293fef?version=4.2.10) was adapted for this project.
- [Spinner](https://github.com/EmilTholin/svelte-spinner/) was taken to use for the spinner.
- [Luxon](https://www.npmjs.com/package/luxon) is used for date manipulation and caluclations.
