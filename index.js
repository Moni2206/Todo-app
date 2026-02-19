//  HENT ELEMENTER
const addTaskBtn = document.querySelector("#addBtn");
const addCategoryBtn = document.querySelector("#addCategoryBtn");
const taskInput = document.querySelector("#taskInput");
const amountInput = document.querySelector("#amountInput");
const categoryInput = document.querySelector("#categoryInput");
const categorySelect = document.querySelector("#categorySelect");
const categoryList = document.querySelector("#categoryList");
const doneList = document.querySelector("#doneList");
const feedback = document.getElementById("feedback");

//  GLOBAL ARRAY
let tasks = [];

//  GEM / LOAD TASKS
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveCategories() {
  const categories = Array.from(document.querySelectorAll("[data-category]")).map((el) => el.getAttribute("data-category"));
  localStorage.setItem("categories", JSON.stringify(categories));
}

function loadTasks() {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  renderTasks();
}

function renderTasks() {
  // ryd lister
  document.querySelectorAll("[data-category-tasks]").forEach((list) => (list.innerHTML = ""));
  doneList.innerHTML = "";

  tasks.forEach((task) => {
    const targetList = task.done ? doneList : document.querySelector(`[data-category-tasks="${task.category}"]`);
    if (!targetList) return;

    const li = document.createElement("li");
    li.setAttribute("data-id", task.id);
    li.setAttribute("data-category", task.category);
    if (task.done) li.classList.add("done-task");

    li.innerHTML = `
      <div class="task-item-wrapper">
        <div class="task-text">${task.text} (${task.amount})</div>
        <div class="task-buttons">
          <button class="deleteBtn"><img src="img/bin.png" width="18"></button>
          <button class="doneBtn">${task.done ? "🟦" : "⬛"}</button>
        </div>
      </div>
    `;

    // Delete
    li.querySelector(".deleteBtn").addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    // Done / Undo
    li.querySelector(".doneBtn").addEventListener("click", () => {
      task.done = !task.done;
      saveTasks();
      renderTasks();
    });

    targetList.appendChild(li);
  });

  // update counts per category
  document.querySelectorAll("[data-category]").forEach((group) => {
    const cat = group.getAttribute("data-category");
    const count = tasks.filter((t) => (t.category || "").trim() === (cat || "").trim() && !t.done).length;
    const span = group.querySelector(".category-count");
    if (span) span.textContent = ` (${count})`;
  });
}

// === KATEGORI ===
function createCategory(categoryValue) {
  if (document.querySelector(`[data-category="${categoryValue}"]`)) {
    showFeedback("Kategori findes allerede!");
    return;
  }

  const categoryGroup = document.createElement("div");
  categoryGroup.setAttribute("data-category", categoryValue);

  const headerDiv = document.createElement("div");
  headerDiv.className = "category-header";

  const title = document.createElement("h3");
  title.textContent = categoryValue;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "deleteBtn";
  deleteBtn.innerHTML = '<img src="img/bin.png" width="18">';
  // add count span to title
  const countSpan = document.createElement("span");
  countSpan.className = "category-count";
  countSpan.textContent = " (0)";
  title.appendChild(countSpan);
  deleteBtn.addEventListener("click", () => {
    // fjern kategori
    categoryGroup.remove();
    categorySelect.querySelector(`option[value="${categoryValue}"]`)?.remove();
    // fjern kun tasks der er i kategorien (ikke done tasks)
    tasks = tasks.filter((t) => {
      const sameCategory = (t.category || "").trim() === (categoryValue || "").trim();
      // Behold tasks der er done ELLER ikke fra denne kategori
      return !(sameCategory && !t.done);
    });
    saveTasks();
    saveCategories();
    renderTasks();
  });

  const tasksList = document.createElement("ul");
  tasksList.setAttribute("data-category-tasks", categoryValue);

  headerDiv.appendChild(title);
  headerDiv.appendChild(deleteBtn);
  categoryGroup.appendChild(headerDiv);
  categoryGroup.appendChild(tasksList);
  categoryList.appendChild(categoryGroup);

  const option = document.createElement("option");
  option.value = categoryValue;
  option.textContent = categoryValue;
  categorySelect.appendChild(option);

  saveCategories();
}

// === FEEDBACK ===

function showFeedback(msg) {
  const feedback = document.getElementById("feedback");

  if (!feedback) return; // sikkerhed

  feedback.textContent = msg;

  setTimeout(() => {
    feedback.textContent = "";
  }, 2000);
}

// === TILFØJ KATEGORI ===
addCategoryBtn.addEventListener("click", () => {
  const value = categoryInput.value.trim();
  if (!value) {
    showFeedback("Indtast en kategori!");
    return;
  }
  createCategory(value);
  categoryInput.value = "";
});

// === TILFØJ TASK ===
addTaskBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const amount = amountInput.value.trim() || 1;
  const category = categorySelect.value.trim();

  if (!text || !category) {
    showFeedback("Fill in the field and select a category!");
    return;
  }

  const taskObj = {
    id: Date.now(),
    text: text,
    amount: amount,
    category: category,
    done: false,
  };

  tasks.push(taskObj);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  amountInput.value = "";
});

// === LOAD DATA PÅ START ===
window.addEventListener("DOMContentLoaded", () => {
  // Load kategorier
  const savedCategories = JSON.parse(localStorage.getItem("categories")) || [];
  savedCategories.forEach((cat) => createCategory(cat));

  // Load tasks
  loadTasks();
});
