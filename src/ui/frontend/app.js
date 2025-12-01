
const apiRoot = '/tasks';


function showLoading(show = true) {
  const el = document.getElementById('loading');
  if (!el) return;
  el.classList.toggle('hidden', !show);
}

function showToast(message, type = 'info'){
  if (typeof process !== "undefined" && process.env.JEST_WORKER_ID !== undefined) {
    return;
  }

  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = message;
  container.appendChild(t);
  setTimeout(()=>{ t.classList.add('hide'); setTimeout(()=>t.remove(),300); }, 3000);
}

async function fetchTasks() {
  try {
    const res = await fetch(apiRoot);
    if (!res.ok) throw new Error('No se pudo obtener tareas');
    return res.json();
  } catch (e) {
    console.error('Error fetching tasks', e);
    showToast('Error al cargar tareas', 'danger');
    return [];
  }
}

async function createTask(data) {
  try {
    const res = await fetch(apiRoot, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('create failed');
    return res.json();
  } catch (e) {
    showToast('Error al crear tarea', 'danger');
    throw e;
  }
}

async function deleteTask(id) {
  try {
    const res = await fetch(`${apiRoot}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('delete failed');
    return true;
  } catch (e) {
    showToast('Error al eliminar', 'danger');
    throw e;
  }
}

function isCompleted(task) {
  if (task.status !== undefined) return Number(task.status) === 1;
  return !!task.completed;
}

async function toggleComplete(task) {
  try {
    const newStatus = isCompleted(task) ? 0 : 1;
    const payload = { ...task, status: newStatus };
    const res = await fetch(`${apiRoot}/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('update failed');
    return res.json();
  } catch (e) {
    showToast('Error al actualizar', 'danger');
    throw e;
  }
}

async function updateTask(id, data) {
  try {
    const res = await fetch(`${apiRoot}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('update failed');
    return res.json();
  } catch (e) {
    showToast('Error al actualizar', 'danger');
    throw e;
  }
}

// ======================================================
// RENDER TASK CARD
// ======================================================
function makeTaskElement(t) {
  const li = document.createElement('li');
  li.className = 'task-card';

  const header = document.createElement('div');
  header.className = 'task-card-header';
  const title = document.createElement('div');
  title.className = 'task-card-title';
  title.textContent = t.title || '(sin título)';
  const meta = document.createElement('div');
  meta.className = 'task-card-meta';
  meta.textContent = isCompleted(t) ? 'Completada' : 'Pendiente';
  header.appendChild(title);
  header.appendChild(meta);

  const body = document.createElement('div');
  body.className = 'task-card-body';
  if (t.description) {
    const p = document.createElement('div');
    p.className = 'task-desc';
    p.textContent = t.description;
    body.appendChild(p);
  }

  const metaRow = document.createElement('div');
  metaRow.className = 'task-meta-row';

  if (t.dueDate) {
    const d = document.createElement('div');
    d.className = 'task-due';
    try {
      d.textContent = new Date(t.dueDate).toLocaleDateString();
    } catch (err) {
      d.textContent = t.dueDate;
    }
    metaRow.appendChild(d);
  }

  const pr = document.createElement('div');
  pr.className =
    'task-priority ' +
    (t.priority == 2
      ? 'priority-high'
      : t.priority == 1
      ? 'priority-medium'
      : 'priority-low');
  pr.textContent =
    Number(t.priority) === 2
      ? 'Alta'
      : Number(t.priority) === 1
      ? 'Media'
      : 'Baja';
  metaRow.appendChild(pr);
  body.appendChild(metaRow);

  const footer = document.createElement('div');
  footer.className = 'task-card-footer';
  const left = document.createElement('div');
  left.className = 'task-left';
  const chk = document.createElement('input');
  chk.type = 'checkbox';
  chk.checked = isCompleted(t);
  chk.addEventListener('change', async () => {
    showLoading(true);
    try {
      await toggleComplete(t);
      showToast('Tarea actualizada', 'success');
      await load();
    } catch (e) {
      console.error(e);
      showToast('Error actualizando', 'danger');
    } finally {
      showLoading(false);
    }
  });
  left.appendChild(chk);

  const actions = document.createElement('div');
  actions.className = 'task-actions';
  const edit = document.createElement('button');
  edit.className = 'btn';
  edit.textContent = 'Editar';
  edit.addEventListener('click', () => {
    openModal('edit', t);
  });

  const del = document.createElement('button');
  del.className = 'btn btn-destructive';
  del.textContent = 'Eliminar';
  del.addEventListener('click', async () => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    showLoading(true);
    try {
      await deleteTask(t._id);
      showToast('Tarea eliminada', 'success');
      await load();
    } catch (err) {
      console.error(err);
      showToast('Error eliminando', 'danger');
    } finally {
      showLoading(false);
    }
  });

  actions.appendChild(edit);
  actions.appendChild(del);

  footer.appendChild(left);
  footer.appendChild(actions);

  li.appendChild(header);
  li.appendChild(body);
  li.appendChild(footer);
  return li;
}

// ======================================================
// RENDER LISTS
// ======================================================
function renderTasks(tasks) {
  const pendingList = document.getElementById('pending-list');
  const completedList = document.getElementById('completed-list');
  const pendingEmpty = document.getElementById('pending-empty');
  const completedEmpty = document.getElementById('completed-empty');
  const pendingCount = document.getElementById('pending-count');
  const completedCount = document.getElementById('completed-count');
  const totalCount = document.getElementById('total-count');

  pendingList.innerHTML = '';
  completedList.innerHTML = '';

  const pending = [];
  const completed = [];

  for (const t of tasks || []) {
    const s = Number(t.status ?? 0);
    if (s === 1) completed.push(t);
    else pending.push(t);
  }

  pendingCount.textContent = String(pending.length);
  completedCount.textContent = String(completed.length);

  if (totalCount) totalCount.textContent = String(pending.length + completed.length);

  pendingEmpty.classList.toggle('hidden', pending.length > 0);
  completedEmpty.classList.toggle('hidden', completed.length > 0);

  for (const t of pending) {
    const el = makeTaskElement(t);
    const p = Number(t.priority ?? 0);
    el.classList.add(
      p === 2 ? 'priority-high-card' : p === 1 ? 'priority-medium-card' : 'priority-low-card'
    );
    pendingList.appendChild(el);
  }

  for (const t of completed) {
    const el = makeTaskElement(t);
    const p = Number(t.priority ?? 0);
    el.classList.add(
      p === 2 ? 'priority-high-card' : p === 1 ? 'priority-medium-card' : 'priority-low-card'
    );
    completedList.appendChild(el);
  }
}

// ======================================================
// MODAL
// ======================================================
let modalMode = 'create';
let modalEditingId = null;

function openModal(mode = 'create', task = null) {
  modalMode = mode;
  modalEditingId = task?._id || null;

  document.getElementById('modal-title').textContent =
    mode === 'create' ? 'Nueva tarea' : 'Editar tarea';

  document.getElementById('modal-title-input').value = task?.title || '';
  document.getElementById('modal-desc-input').value = task?.description || '';

  const dueEl = document.getElementById('modal-due-input');
  const prEl = document.getElementById('modal-priority-input');
  const stEl = document.getElementById('modal-status-input');

  if (dueEl) {
    dueEl.value =
      task && task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : '';
  }

  if (prEl) {
    prEl.value =
      task && task.priority !== undefined ? String(task.priority) : '0';
  }

  if (stEl) {
    stEl.value =
      task && task.status !== undefined ? String(task.status) : '0';
  }

  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// ======================================================
// DOM LISTENERS — SOLO SI EXISTEN (PARA JEST)
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
  const modalCancel = document.getElementById('modal-cancel');
  if (modalCancel) {
    modalCancel.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  const modalForm = document.getElementById('modal-form');
  if (modalForm) {
    modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('modal-title-input').value.trim();
      const desc = document.getElementById('modal-desc-input').value.trim();
      const due = document.getElementById('modal-due-input').value;
      const priority = Number.parseInt(
        document.getElementById('modal-priority-input').value || '0',
        10
      );
      const status = Number.parseInt(
        document.getElementById('modal-status-input').value || '0',
        10
      );

      if (!title) return showToast('El título es obligatorio', 'danger');

      closeModal();
      showLoading(true);

      try {
        const payload = { userId: 'local-user', title, description: desc };
        if (due) payload.dueDate = new Date(due).toISOString();
        if (!Number.isNaN(priority)) payload.priority = priority;
        if (!Number.isNaN(status)) payload.status = status;

        if (modalMode === 'create') {
          await createTask(payload);
          showToast('Tarea creada', 'success');
        } else {
          await updateTask(modalEditingId, payload);
          showToast('Tarea actualizada', 'success');
        }

        await load();
      } catch (err) {
        console.error(err);
        showToast('Error procesando la tarea', 'danger');
      } finally {
        showLoading(false);
      }
    });
  }

  const openCreateBtn = document.getElementById('open-create');
  if (openCreateBtn) {
    openCreateBtn.addEventListener('click', () => openModal('create'));
  }

  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', async (e) => {
      const q = e.target.value.trim().toLowerCase();
      const tasks = await fetchTasks();
      const filtered = tasks.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
      renderTasks(filtered);
    });
  }

  // initial load
  void load();
});

// ======================================================
// If DOM is already ready (rare in Jest), run load
// ======================================================
if (typeof process === "undefined" || process.env.JEST_WORKER_ID === undefined) {
  if (document.readyState !== 'loading') {
    void load();
  } else {
    document.addEventListener('DOMContentLoaded', () => void load());
  }
}

// Exportar funciones para Jest
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    isCompleted,
    fetchTasks,
    createTask,
    deleteTask,
    toggleComplete,
    makeTaskElement,
    showToast,
  };
}

