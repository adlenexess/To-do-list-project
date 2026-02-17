const STORAGE_KEY = "todos.v1";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const template = document.getElementById("todo-item-template");
const itemsLeft = document.getElementById("items-left");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedButton = document.getElementById("clear-completed");

/** @type {{id:string, text:string, completed:boolean}[]} */
let todos = loadTodos();
let currentFilter = "all";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    return;
  }

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });

  input.value = "";
  persist();
  render();
});

list.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const row = target.closest(".todo-item");
  if (!row) {
    return;
  }

  const id = row.dataset.id;
  if (!id) {
    return;
  }

  if (target.classList.contains("delete-btn")) {
    todos = todos.filter((todo) => todo.id !== id);
    persist();
    render();
    return;
  }

  if (target.classList.contains("edit-btn")) {
    const todo = todos.find((item) => item.id === id);
    if (!todo) {
      return;
    }

    const nextText = window.prompt("Edit task:", todo.text);
    if (nextText === null) {
      return;
    }

    const trimmed = nextText.trim();
    if (!trimmed) {
      return;
    }

    todo.text = trimmed;
    persist();
    render();
  }
});

list.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("todo-toggle")) {
    return;
  }

  const row = target.closest(".todo-item");
  const id = row?.dataset.id;
  if (!id) {
    return;
  }

  const todo = todos.find((item) => item.id === id);
  if (!todo) {
    return;
  }

  todo.completed = target.checked;
  persist();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter || "all";
    filterButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    render();
  });
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  persist();
  render();
});

function render() {
  list.innerHTML = "";

  const filtered = todos.filter((todo) => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  for (const todo of filtered) {
    const node = template.content.firstElementChild.cloneNode(true);
    if (!(node instanceof HTMLLIElement)) {
      continue;
    }

    node.dataset.id = todo.id;
    node.classList.toggle("completed", todo.completed);

    const text = node.querySelector(".todo-text");
    const toggle = node.querySelector(".todo-toggle");

    if (text) text.textContent = todo.text;
    if (toggle instanceof HTMLInputElement) toggle.checked = todo.completed;

    list.appendChild(node);
  }

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const label = activeCount === 1 ? "item" : "items";
  itemsLeft.textContent = `${activeCount} ${label} left`;
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.text === "string" &&
        typeof item.completed === "boolean"
    );
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

render();
