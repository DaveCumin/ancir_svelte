import { writable } from "svelte/store";

export var data = writable([]);

//GRAPHS
export var graphTabs = writable([]);
export var activeGraphTab = writable(-1);
export var graphs = writable([]);
export var addedNewChartData = writable(false);

//TABLES
export var dataIDsforTables = writable([]);
export var showalldata = writable([]);
export var activeTableTab = writable(-1);

//MENU MODAL
export var menuModalType = writable(null);

//CONTEXT MENU
export var contextMenu = writable({
  labels: [],
  funcs: [],
});

//THEME
export var selectedTheme = writable("light");
export var userStyle = writable({
  "--bg-color": "#fff",
  "--font-color": "#424242",
  "--hover-color": "#eee",
  "--primary-color": "lightblue",
  "--secondary-color": "#888888",
});

//STATUS DATA
export var statusData = writable([]);
