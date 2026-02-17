// === HENT HTML ELEMENTER ===
const addTaskBtn = document.querySelector("#addBtn");
const addCategoryBtn = document.querySelector("#addCategoryBtn");
const taskInput = document.querySelector("#taskInput");
const amountInput = document.querySelector("#amountInput");
const categoryInput = document.querySelector("#categoryInput");
const categorySelect = document.querySelector("#categorySelect");
const categoryList = document.querySelector("#categoryList");
const doneList = document.querySelector("#doneList");

// === VIS / SKJUL DONE SECTION ===
function toggleDoneSection() {
  const doneSection = document.querySelector(".done-section");
  // Always show Done section
  doneSection.style.display = "block";
}

// === GEM DATA ===
function saveCategories() {
  const categories = [];
  document.querySelectorAll("[data-category]").forEach((group) => {
    categories.push(group.getAttribute("data-category"));
  });
  localStorage.setItem("categories", JSON.stringify(categories));
}

function saveTasks() {
  const tasks = [];

  // tasks in categories
  document.querySelectorAll("[data-category-tasks]").forEach((list) => {
    const category = list.getAttribute("data-category-tasks");

    list.querySelectorAll("li").forEach((item) => {
      const text = item.querySelector(".task-text").textContent;
      tasks.push({ category, text, done: false });
    });
  });

  // tasks in done list
  const doneEl = document.querySelector("#doneList");
  if (doneEl) {
    doneEl.querySelectorAll("li").forEach((item) => {
      const text = item.querySelector(".task-text").textContent;
      const category = item.getAttribute("data-category") || null;
      tasks.push({ category, text, done: true });
    });
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// === OPRET TASK ELEMENT ===
function createTaskElement(text, category, tasksList, isDone = false) {
  const li = document.createElement("li");
  if (category) li.setAttribute("data-category", category);

  const wrapper = document.createElement("div");
  wrapper.className = "task-item-wrapper";

  const textDiv = document.createElement("div");
  textDiv.className = "task-text";
  textDiv.textContent = text;

  const buttonDiv = document.createElement("div");
  buttonDiv.className = "task-buttons";

  // Delete
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "deleteBtn";
  deleteBtn.innerHTML = '<img src="img/bin.png" width="18">';

  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTasks();
    toggleDoneSection();
  });

  // Done
  const doneBtn = document.createElement("button");
  doneBtn.textContent = "⬛";

  if (!isDone) {
    doneBtn.addEventListener("click", () => {
      // move to done list and mark
      tasksList.removeChild(li);
      li.setAttribute("data-category", category || "");
      doneList.appendChild(li);
      doneBtn.textContent = "🟦";
      saveTasks();
      toggleDoneSection();
    });
  } else {
    // when already done, clicking will move back to its category if possible
    doneBtn.addEventListener("click", () => {
      const originalCategory = li.getAttribute("data-category");
      const targetList = document.querySelector(`[data-category-tasks="${originalCategory}"]`);
      if (targetList) {
        doneList.removeChild(li);
        targetList.appendChild(li);
        doneBtn.textContent = "⬛";
        saveTasks();
        toggleDoneSection();
      }
    });
  }

  buttonDiv.appendChild(deleteBtn);
  buttonDiv.appendChild(doneBtn);

  wrapper.appendChild(textDiv);
  wrapper.appendChild(buttonDiv);

  li.appendChild(wrapper);

  return li;
}

// === LOAD DATA ===
function loadData() {
  const savedCategories = JSON.parse(localStorage.getItem("categories")) || [];
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  savedCategories.forEach((categoryValue) => {
    createCategory(categoryValue);
  });

  savedTasks.forEach((task) => {
    if (task.done) {
      // create element in done list (preserve category on li)
      const el = createTaskElement(task.text, task.category, doneList, true);
      doneList.appendChild(el);
    } else {
      const tasksList = document.querySelector(`[data-category-tasks="${task.category}"]`);
      if (tasksList) {
        const taskElement = createTaskElement(task.text, task.category, tasksList, false);
        tasksList.appendChild(taskElement);
      }
    }
  });

  toggleDoneSection();
}

window.addEventListener("DOMContentLoaded", loadData);

// === OPRET KATEGORI ===
function createCategory(categoryValue) {
  const categoryGroup = document.createElement("div");
  categoryGroup.setAttribute("data-category", categoryValue);

  const headerDiv = document.createElement("div");
  headerDiv.className = "category-header";

  const title = document.createElement("h3");
  title.textContent = categoryValue;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "deleteBtn";
  deleteBtn.innerHTML = '<img src="img/bin.png" width="18">';

  deleteBtn.addEventListener("click", () => {
    categoryGroup.remove();
    categorySelect.querySelector(`option[value="${categoryValue}"]`)?.remove();
    saveCategories();
    saveTasks();
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

// === TILFØJ KATEGORI ===
addCategoryBtn.addEventListener("click", () => {
  const value = categoryInput.value.trim();
  if (!value) return;

  createCategory(value);
  categoryInput.value = "";
});

// === TILFØJ TASK ===
addTaskBtn.addEventListener("click", () => {
  const text = `${taskInput.value} ${amountInput.value}`.trim();
  const selectedCategory = categorySelect.value;

  if (!text || !selectedCategory) {
    alert("Udfyld felt og vælg kategori!");
    return;
  }

  const tasksList = document.querySelector(`[data-category-tasks="${selectedCategory}"]`);

  const taskElement = createTaskElement(text, selectedCategory, tasksList);

  tasksList.appendChild(taskElement);

  taskInput.value = "";
  amountInput.value = "";

  saveTasks();
});
