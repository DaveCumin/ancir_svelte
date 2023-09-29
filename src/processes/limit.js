export function limit(
  startVals = [1, 2, 3],
  params = { min: 1, max: 3 },
  processMode = "do"
) {
  // Takes in a min and max value, and limits the data to that range.
  // If either is a NaN, then there is no limit at that side (min or max)
  // Thus, default values are the min and max of the startVals
  // If the input values are times, then it should make all values outside [min, max] NaN

  //IF THE DATA ARE VALUES
  console.log(startVals);
  const dataMin = Math.min(...startVals);
  const dataMax = Math.max(...startVals);

  if (processMode == "do") {
    var arr = [...startVals];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] < params.min) {
        arr[i] = params.min;
      } else if (arr[i] > params.max) {
        arr[i] = params.max;
      }
    }
    return arr;
  }

  if (processMode == "show") {
    return [
      {
        label: "Min",
        value: dataMin,
        type: "slider",
        range: [dataMin, dataMax],
      },
      {
        label: "Max",
        value: dataMax,
        type: "slider",
        range: [dataMin, dataMax],
      },
    ];
  }
}
