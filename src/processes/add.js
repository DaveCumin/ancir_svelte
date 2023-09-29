// Define the functions
export function add(
  startVals = [1, 2, 3],
  params = { val: 0 },
  processMode = "do"
) {
  //ADDS A SET VALUE TO EACH OF THE ARRAY VALUES

  //IF THE DATA ARE VALUES
  if (processMode == "do") {
    var arr = [...startVals];
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i] + params.val;
    }

    return arr;
  }
}
