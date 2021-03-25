// Const's in HTML
const addBtns = document.querySelectorAll('.add-btn:not(.solid)');
const saveItemBtns = document.querySelectorAll('.solid');
const addItemContainers = document.querySelectorAll('.add-container');
const addItems = document.querySelectorAll('.add-item');
// Item Lists
const listColumns = document.querySelectorAll('.drag-item-list');
const backlogListEl = document.getElementById('backlog-list');
const progressListEl = document.getElementById('progress-list');
const completeListEl = document.getElementById('complete-list');
const onHoldListEl = document.getElementById('on-hold-list');

// Items
let updatedOnLoad = false;

// Initializierte Arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [];

// Drag Funktionalität
let draggedItem;
let dragging = false;
let currentColumn;

// Arrays aus localStorage holen, falls vorhanden, ansonsten Standardwerte setzen
function getSavedColumns() {
  if (localStorage.getItem('backlogItems')) {
    backlogListArray = JSON.parse(localStorage.backlogItems);
    progressListArray = JSON.parse(localStorage.progressItems);
    completeListArray = JSON.parse(localStorage.completeItems);
    onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    backlogListArray = ['Portfolio veröffentlichen', 'Zeit zum entspannen'];
    progressListArray = ['Arbeite am Projekt', 'Mache Sport'];
    completeListArray = ['Entspannt sein', 'Aufgaben'];
    onHoldListArray = ['Feedback'];
  }
}

// localStorage-Arrays einstellen
function updateSavedColumns() {
  listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray];
  const arrayNames = ['backlog', 'progress', 'complete', 'onHold'];
  arrayNames.forEach((arrayName, index) => {
    localStorage.setItem(`${arrayName}Items`, JSON.stringify(listArrays[index]));
  });
}

// Filter Array um leere Werte zu entfernen
function filterArray(array) {
  const filteredArray = array.filter(item => item !== null);
  return filteredArray;
}

// DOM-Elemente für jedes Listenelement erstellen
function createItemEl(columnEl, column, item, index) {
  // Liste Item
  const listEl = document.createElement('li');
  listEl.textContent = item;
  listEl.id = index;
  listEl.classList.add('drag-item');
  listEl.draggable = true;
  listEl.setAttribute('onfocusout', `updateItem(${index}, ${column})`);
  listEl.setAttribute('ondragstart', 'drag(event)');
  listEl.contentEditable = true;
  // Erweitern
  columnEl.appendChild(listEl);
}

// Column im DOM aktualisieren - HTML zurücksetzen, Array filtern, localStorage aktualisieren
function updateDOM() {
  // Check localStorage einmal
  if (!updatedOnLoad) {
    getSavedColumns();
  }
  // Backlog Column (damit alle Elemente resetet und entfernt werden können)
  backlogListEl.textContent = '';
  backlogListArray.forEach((backlogItem, index) => {
    createItemEl(backlogListEl, 0, backlogItem, index);
  });
  backlogListArray = filterArray(backlogListArray);
  // Bearbeitung Column
  progressListEl.textContent = '';
  progressListArray.forEach((progressItem, index) => {
    createItemEl(progressListEl, 1, progressItem, index);
  });
  progressListArray = filterArray(progressListArray);
  // Erledigt Column
  completeListEl.textContent = '';
  completeListArray.forEach((completeItem, index) => {
    createItemEl(completeListEl, 2, completeItem, index);
  });
  completeListArray = filterArray(completeListArray);
  // Warten Column
  onHoldListEl.textContent = '';
  onHoldListArray.forEach((onHoldItem, index) => {
    createItemEl(onHoldListEl, 3, onHoldItem, index);
  });
  onHoldListArray = filterArray(onHoldListArray);
  // getSavedColumns nur einmal ausführen, lokalen Speicher aktualisieren
  updatedOnLoad = true;
  updateSavedColumns();
}

// Item aktualisieren - Löschen wenn nötig, oder Array Wert aktualisieren
function updateItem(id, column) {
  const selectedArray = listArrays[column];
  const selectedColumn = listColumns[column].children;
  if (!dragging) {
    if (!selectedColumn[id].textContent) {
      delete selectedArray[id];
    } else {
      selectedArray[id] = selectedColumn[id].textContent;
    }
    updateDOM();
  }
}

// Zu Column hinzufügen List, Reset Textbox
function addToColumn(column) {
  const itemText = addItems[column].textContent;
  const selectedArray = listArrays[column];
  selectedArray.push(itemText);
  addItems[column].textContent = '';
  updateDOM(column);
}

// Zeige Item hinzufügen Input Box
function showInputBox(column) {
  addBtns[column].style.visibility = 'hidden';
  saveItemBtns[column].style.display = 'flex';
  addItemContainers[column].style.display = 'flex';
}

// Item verbergen Input Box
function hideInputBox(column) {
  addBtns[column].style.visibility = 'visible';
  saveItemBtns[column].style.display = 'none';
  addItemContainers[column].style.display = 'none';
  addToColumn(column);
}

// Erlaubt Arrays zu reflektieren und Items Drag & Drop 
// Alternative mit map, forEach, filter - function
function rebuildArrays() {
  backlogListArray = [];
  for (let i = 0; i < backlogListEl.children.length; i++) {
    backlogListArray.push(backlogListEl.children[i].textContent);
  }
  progressListArray = [];
  for (let i = 0; i < progressListEl.children.length; i++) {
    progressListArray.push(progressListEl.children[i].textContent);
  }
  completeListArray = [];
  for (let i = 0; i < completeListEl.children.length; i++) {
    completeListArray.push(completeListEl.children[i].textContent);
  }
  onHoldListArray = [];
  for (let i = 0; i < onHoldListEl.children.length; i++) {
    onHoldListArray.push(onHoldListEl.children[i].textContent);
  }
  updateDOM();
}

// Wenn Item in Column Bereich
function dragEnter(column) {
  listColumns[column].classList.add('over');
  currentColumn = column;
}

// Wenn Item start dragging
function drag(e) {
  draggedItem = e.target;
  dragging = true;
}

// Column Erlaubsnis für Item to drop
function allowDrop(e) {
  e.preventDefault();
}

// Dropping Item in Column
function drop(e) {
  e.preventDefault();
  const parent = listColumns[currentColumn];
  // Background Color/Padding entfernen
  listColumns.forEach((column) => {
    column.classList.remove('over');
  });
  // Item zu Column hinzufügen
  parent.appendChild(draggedItem);
  // Dragging vollständig
  dragging = false;
  rebuildArrays();
}

// On Load
updateDOM();