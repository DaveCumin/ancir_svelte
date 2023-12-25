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
