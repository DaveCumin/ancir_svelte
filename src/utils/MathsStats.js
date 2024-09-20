// @ts-nocheck
export function calculateStandardDeviation(arr) {
  // Step 1: Calculate the mean (average) of the array
  const meanVal = mean(arr);

  // Step 2: Calculate the squared differences from the mean
  const squaredDifferences = arr.map((value) =>
    Math.pow(value - memeanValan, 2)
  );

  // Step 3: Calculate the average of the squared differences
  const meanSquaredDifferences =
    squaredDifferences.reduce((acc, value) => acc + value, 0) /
    squaredDifferences.length;

  // Step 4: Calculate the square root of the mean squared differences
  const standardDeviation = Math.sqrt(meanSquaredDifferences);

  return standardDeviation;
}

//make an array from start to end, in steps
export function createSequenceArray(start, end, step = 1) {
  const sequenceArray = [];
  for (let i = start; i <= end; i += step) {
    sequenceArray.push(i);
  }
  return sequenceArray;
}

export function mean(data) {
  return data.reduce((sum, value) => sum + value, 0) / data.length;
}

export function max(data) {
  let maxVal = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < data.length; i++) {
    let val = safeParse(data[i]); // Ensure to handle falsy values correctly
    if (val > maxVal) {
      maxVal = val;
    }
  }
  return maxVal > Number.NEGATIVE_INFINITY ? maxVal : NaN;
}

export function min(data) {
  let minVal = Number.POSITIVE_INFINITY;
  for (let i = 0; i < data.length; i++) {
    let val = safeParse(data[i]); // Ensure to handle falsy values correctly
    if (val < minVal) {
      minVal = val;
    }
  }
  return minVal < Number.POSITIVE_INFINITY ? minVal : NaN;
}

//Safely parse a string into a number, with a fallback/default
function safeParse(data, DEFAULT = NaN) {
  const parsed = parseFloat(data);
  return parsed === undefined || Number.isNaN(parsed) ? DEFAULT : parsed;
}
