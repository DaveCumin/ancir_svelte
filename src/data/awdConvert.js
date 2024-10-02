// @ts-nocheck
//convert file from awd to csv

import { DateTime } from "luxon";

export function awdTocsv(resultsData) {
  let dataOUT = [];
  const theKey = Object.keys(resultsData[0]);

  //get the Start time
  const startTime = DateTime.fromFormat(
    resultsData[0][theKey] + " " + resultsData[1][theKey],
    "dd-LL-yyyy HH:mm:ss"
  );

  //get the steps this in in minutes * 4 (https://actimetrics.com/text-based-clocklab-data-format/)
  const step = Number(resultsData[2][theKey]) / 4;

  for (let i = 6; i < resultsData.length; i++) {
    dataOUT[i - 6] = {
      time: startTime
        .plus({ minutes: (i - 6) * step })
        .toFormat("dd-LL-yyyy HH:mm:ss"),
      value: resultsData[i][theKey],
    };
  }

  return dataOUT;
}
