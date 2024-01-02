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
export var contextMenu = writable({
  labels: [],
  funcs: [],
});

//THEME
export let selectedTheme = writable("light");

//IMPORT
export var importFileOpen = writable(false);
