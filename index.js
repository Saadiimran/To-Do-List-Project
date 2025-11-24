const form = document.querySelector(".taskForm");
const taskList = document.getElementById("taskList");
const API = "./tasks.php";
const esc = (s) => {
  return (s == null ? "" : String(s))
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
};

const createTaskElement = (task) => {
  const card = document.createElement("div");
  card.className = "task-card";
  card.dataset.id = task.id;

  card.innerHTML = `
    <div class="task-main">
      <div class="task-left">
        <strong class="task-title ${task.is_done == 1 ? "done" : ""}">${esc(
    task.title
  )}</strong>
        <div class="task-desc">${esc(task.description || "")}</div>
        <div class="task-meta">Priority: <span class="task-priority">${esc(
          task.priority
        )}</span> • Created: ${esc(task.created_at)}</div>
      </div>
      <div class="task-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    </div>
  `;
  card
    .querySelector(".delete-btn")
    .addEventListener("click", () => deleteTask(task.id, card));
  card
    .querySelector(".edit-btn")
    .addEventListener("click", () => editTask(task, card));

  return card;
};

const appendTaskToDOM = (task, onTop = true) => {
  const el = createTaskElement(task);
  if (onTop && taskList.firstChild)
    taskList.insertBefore(el, taskList.firstChild);
  else taskList.appendChild(el);
};

const loadTasks = async () => {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Failed to load tasks: " + res.status);
    const data = await res.json();
    taskList.innerHTML = "";
    (Array.isArray(data) ? data : []).forEach((t) => appendTaskToDOM(t, false));
  } catch (err) {
    console.error(err);
    taskList.innerHTML = '<p class="error">Could not load tasks.</p>';
  }
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = form.querySelector("input[name='title']").value.trim();
  const priority =
    form.querySelector("input[name='priority']:checked")?.value ?? null;
  const description = form
    .querySelector("textarea[name='description']")
    .value.trim();

  if (!title) return alert("Title is required");

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority, description }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Server error:", text);
      alert("Create failed");
      return;
    }
    if (!text) {
      alert("Empty response from server");
      return;
    }
    const task = JSON.parse(text);
    appendTaskToDOM(task, true);
    form.reset();
  } catch (err) {
    console.error("Network error", err);
    alert("Network error while creating task");
  }
});

async function deleteTask(id, cardEl) {
  if (!confirm("Delete this task?")) return;
  try {
    const res = await fetch(`${API}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("Delete failed:", res.status, text);
      alert("Delete failed");
      return;
    }
    cardEl.remove();
  } catch (err) {
    console.error(err);
    alert("Network error while deleting");
  }
}

// EDIT (simple prompt UI)
async function editTask(task, cardEl) {
  const newTitle = prompt("Edit title", task.title);
  if (newTitle === null) return;
  const newDesc = prompt("Edit description", task.description || "");
  if (newTitle.trim() === "") return alert("Title cannot be empty");

  const payload = { title: newTitle.trim(), description: newDesc };

  try {
    const res = await fetch(`${API}?id=${encodeURIComponent(task.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("Update failed:", res.status, text);
      alert("Update failed");
      return;
    }
    const updated = JSON.parse(text);

    // update DOM (replace card)
    const newCard = createTaskElement(updated);
    cardEl.replaceWith(newCard);
  } catch (err) {
    console.error(err);
    alert("Network error while updating");
  }
}

// initial load
loadTasks();
