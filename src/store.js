import { writable } from "svelte/store";

export var data = writable([]);

//GRAPHS
export var graphTabs = writable([]);
export var activeGraphTab = writable(-1);
export var graphs = writable([]);

//TABLES
export var dataIDsforTables = writable([]);
export var showalldata = writable([]);
export var activeTableTab = writable(-1);

//MENU MODAL
export var menuModalActive = writable(false);
export var menuModalType = writable("");
export var contextMenu = writable({
  labels: [],
  funcs: [],
});

//THEME
export var selectedTheme = writable("light");

//IMPORT FLAG
export var importFileOpen = writable(false);

//STATUS DATA
export var statusData = writable([]);
