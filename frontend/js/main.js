document.getElementById('year').textContent = new Date().getFullYear();

let tasks = [];

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
  };
}

async function loadTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '<li class="loading">Loading tasks…</li>';
  try {
    const res = await fetch(`${API_BASE_URL}/tasks`, { headers: authHeaders() });
    if (res.status === 401) return handleAuthExpired();
    if (!res.ok) throw new Error('Request failed');
    tasks = await res.json();
    renderTasks();
    renderProgress();
  } catch (err) {
    console.error(err);
    list.innerHTML = '<li class="error">Could not load tasks. Is the backend running?</li>';
  }
}

function handleAuthExpired() {
  clearSession();
  showAuthScreen();
}

function renderTasks() {
  const list = document.getElementById('task-list');
  const clearBtn = document.getElementById('clear-all-btn');

  clearBtn.classList.toggle('hidden', tasks.length === 0);

  if (tasks.length === 0) {
    list.innerHTML = '<li class="empty">No tasks yet — add one above.</li>';
    return;
  }

  list.innerHTML = tasks.map(renderTaskItem).join('');

  list.querySelectorAll('[data-toggle-id]').forEach((btn) => {
    btn.addEventListener('click', () => toggleTask(btn.dataset.toggleId));
  });
  list.querySelectorAll('[data-delete-id]').forEach((btn) => {
    btn.addEventListener('click', () => deleteTask(btn.dataset.deleteId));
  });
}

function renderTaskItem(t) {
  return `
    <li class="task-item ${t.completed ? 'completed' : ''}">
      <div class="task-main">
        <p class="task-text">${escapeHtml(t.text)}</p>
        <p class="task-meta">
          <span class="priority priority-${t.priority}">${t.priority}</span>
          <span class="category">${escapeHtml(t.category)}</span>
        </p>
      </div>
      <div class="task-actions">
        <button class="btn btn-small btn-outline" data-toggle-id="${t.id}">${t.completed ? 'Undo' : 'Complete'}</button>
        <button class="btn btn-small btn-danger" data-delete-id="${t.id}">Delete</button>
      </div>
    </li>
  `;
}

function renderProgress() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById('progress-text').textContent = `${completed} of ${total} task${total === 1 ? '' : 's'} completed`;
  document.getElementById('progress-bar').style.width = `${pct}%`;
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const textInput = document.getElementById('task-text');
  const priority = document.getElementById('task-priority').value;
  const category = document.getElementById('task-category').value;
  const text = textInput.value.trim();
  if (!text) return;

  try {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text, priority, category })
    });
    if (res.status === 401) return handleAuthExpired();
    if (!res.ok) throw new Error('Request failed');
    const newTask = await res.json();
    tasks.unshift(newTask);
    renderTasks();
    renderProgress();
    textInput.value = '';
    document.getElementById('task-priority').value = 'medium';
    document.getElementById('task-category').value = 'general';
  } catch (err) {
    console.error(err);
    alert('Could not add task. Please try again.');
  }
});

async function toggleTask(id) {
  const task = tasks.find((t) => String(t.id) === String(id));
  if (!task) return;
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ completed: !task.completed })
    });
    if (res.status === 401) return handleAuthExpired();
    if (!res.ok) throw new Error('Request failed');
    const updated = await res.json();
    tasks = tasks.map((t) => (String(t.id) === String(id) ? updated : t));
    renderTasks();
    renderProgress();
  } catch (err) {
    console.error(err);
    alert('Could not update task. Please try again.');
  }
}

async function deleteTask(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (res.status === 401) return handleAuthExpired();
    if (!res.ok && res.status !== 204) throw new Error('Request failed');
    tasks = tasks.filter((t) => String(t.id) !== String(id));
    renderTasks();
    renderProgress();
  } catch (err) {
    console.error(err);
    alert('Could not delete task. Please try again.');
  }
}

document.getElementById('clear-all-btn').addEventListener('click', async () => {
  if (!confirm('Delete all tasks? This cannot be undone.')) return;
  try {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (res.status === 401) return handleAuthExpired();
    if (!res.ok && res.status !== 204) throw new Error('Request failed');
    tasks = [];
    renderTasks();
    renderProgress();
  } catch (err) {
    console.error(err);
    alert('Could not clear tasks. Please try again.');
  }
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Load tasks once the user is authenticated (fired by auth.js on login / valid session)
window.addEventListener('taskbud:login', loadTasks);
