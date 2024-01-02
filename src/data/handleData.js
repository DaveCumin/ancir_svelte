import { data, graphs } from "../store";
import { get } from "svelte/store";

export function getDataData(tableID, key) {
  const tempData =
    get(data)[get(data).findIndex((d) => d.id === tableID)].data[key];
  console.log(tempData);
  if (tempData.processedData.length > 0) {
    console.log("has processed");
    return tempData.processedData;
  }
  if (tempData.type === "time") {
    console.log("timeData");
    return tempData.timeData;
  }
  console.log("base");
  return tempData.data;
}
