export function limit(startVals, params, processMode) {
  console.log(startVals);
  console.log(params);
  if (processMode == "do") {
    console.log(startVals);
    console.log(params.min);
    console.log(Math.max(params.min, Math.min(startVals, params.max)));
    return Math.max(params.min, Math.min(startVals, params.max));
  }
  if (processMode == "show") {
    alert("to show");
  }
}
