import { DateTime } from "luxon";
import guessFormat from "moment-guess";
import { calculateStandardDeviation } from "./MathsStats.js";

function convertFormat(formatIN) {
  //moment format string to luxon format string (https://moment.github.io/luxon/#/parsing?id=table-of-tokens)
  const map = {
    from: ["A", "D", "DD", "M", "MM", "YY", "YYYY"],
    to: ["a", "d", "dd", "L", "LL", "yy", "yyyy"],
  };

  let formatOUT = formatIN;

  map.from.forEach((from, index) => {
    const to = map.to[index];
    const regex = new RegExp(`\\b${from}\\b`, "g"); // Using word boundaries to match whole words

    formatOUT = formatOUT.replace(regex, to);
  });

  return formatOUT;
}
function guessDateFormat(dateString) {
  return guessFormat(dateString);
}

function guessDateofArray(dates) {
  //make the first guess on the first date
  let guesses = guessDateFormat(dates[0]);
  //if there is only one guess (type is string, not array) then return that
  if (typeof guesses === "string") {
    return guesses;
  } else {
    // try more values until there is only one guess
    for (let i = 1; i < dates.length; i++) {
      guesses = guessDateFormat(dates[i]);
      if (typeof guesses === "string") {
        console.log(guesses);
        return guesses;
      }
    }
  }
  //if there is still a choice, then take the one where the differences in time are most uniform
  //TODO: remove those with -ve values first!
  let sdEach = [];
  guesses.forEach((g) => {
    console.log(
      "testing " +
        g +
        " -> " +
        calculateTimeDifference(dates[0], dates[1], convertFormat(g))
    );
    let tdiffs = dates.map((date) =>
      calculateTimeDifference(dates[0], date, convertFormat(g))
    );
    console.log("TDIFFS: " + tdiffs);
    sdEach.push(calculateStandardDeviation(tdiffs));
  });
  console.log(sdEach);
  //return the first guess if there is always a choice
  return guesses[0];
}

function calculateTimeDifference(start, end, dateFormat) {
  start = DateTime.fromFormat(start, dateFormat);
  end = DateTime.fromFormat(end, dateFormat);
  var diffTime = end.diff(start, "hours");
  return diffTime.hours;
}

// Takes in an inputted value (ISO format) and the first time and format of
//data. Calculates the offset for actigrams (and other plots).
export function getstartTimeOffset(inputTime, firstTime, timeFormat) {
  let start = DateTime.fromISO(inputTime);
  let end = DateTime.fromFormat(firstTime, convertFormat(timeFormat));
  console.log(inputTime);
  console.log(firstTime);
  console.log(start);
  console.log(end);
  console.log(end.ts - start.ts);
  console.log(end.diff(start, "hours"));
  console.log(end.diff(start, "hours").hours);
  console.log("-------");
  return end.diff(start, "hours").hours;
}

export function makeTimeProcessedData(rawData) {
  let guessedFormat = getGuessedFormat(rawData);
  //convert for Luxon
  guessedFormat = convertFormat(guessedFormat);
  //Make the output
  const dataout = rawData.map((date) =>
    calculateTimeDifference(rawData[0], date, guessedFormat)
  );
  return dataout;
}

export function getGuessedFormat(dataIN) {
  //get the format
  let guessedFormat = guessDateofArray(dataIN);

  return guessedFormat;
}

export function forceFornat(dataIN, formatIN) {
  formatIN = convertFormat(formatIN);
  const dataout = dataIN.map((date) =>
    calculateTimeDifference(dataIN[0], date, formatIN)
  );
  return dataout;
}

///----------------
console.log(DateTime.fromFormatExplain("2023-10-2T11:35", "yyyy-L-dTHH:mm"));
const testRawData = [
  "10/11/2023, 10:35:00 AM",
  "10/11/2023, 15:35:00 AM",
  "10/12/2023, 10:40:00 AM",
  "10/12/2023, 11:35:00 AM",
  "10/13/2023, 10:45:00 AM",
  "10/13/2023, 12:55:00 AM",
];
console.log(makeTimeProcessedData(testRawData));

const testRawData2 = [
  "11/12/2023 10:35:00",
  "10/12/2023 11:35:00",
  "10/12/2023 12:35:00",
  "10/12/2023 13:35:00",
  "10/12/2023 14:35:00",
  "10/12/2023 15:35:00",
];
console.log(makeTimeProcessedData(testRawData2));

console.log(guessDateFormat("2023-06-14T10:00"));
console.log(convertFormat(guessDateFormat("2023-06-14T10:00")));

/*
let now = DateTime.now();

console.log(now.toString());
console.log(now.toMillis());

var end = DateTime.fromISO("2017-03-13");
var start = DateTime.fromISO("2017-02-13");

var diffInMonths = end.diff(start, "hours");
console.log(diffInMonths.toObject());

start = DateTime.fromISO("2023-05-25T11:34:13");
end = DateTime.fromISO("2023-05-25T12:35:14");
diffInMonths = end.diff(start, "minutes");
console.log(diffInMonths.toObject());

//-------------------
// GUESS //npm install moment-guess
let dateString = "31/12/2020";

// Guess the date format
let guessedFormat = guessFormat(dateString);

console.log("Guessed Format:", guessedFormat);

dateString = "12/31/2020";
console.log("Guessed Format:", guessFormat(dateString));

dateString = "10/11/2020";
console.log("Guessed Format:", guessFormat(dateString));

dateString = "12/11/2020 11:31:12";
console.log("Guessed Format:", guessFormat(dateString));

dateString = "12/11/2020 11:31:12";
console.log("Guessed Format:", guessFormat(dateString));
*/
