// @ts-nocheck
export function calculateStandardDeviation(arr) {
  // Step 1: Calculate the mean (average) of the array
  const mean = arr.reduce((acc, value) => acc + value, 0) / arr.length;

  // Step 2: Calculate the squared differences from the mean
  const squaredDifferences = arr.map((value) => Math.pow(value - mean, 2));

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
