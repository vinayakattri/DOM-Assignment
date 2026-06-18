const themeToggle = document.getElementById('themeToggle');
const moonIcon = document.getElementById('moonIcon');

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  showToast(isDark ? "Theme switched to night relaxation mode 🌙" : "Theme switched to soft daylight mode ☀️");
});


let tasks = [
  { id: 1, title: 'Master HTML5 Drag and Drop APIs', category: 'Study', status: 'pending' },
  { id: 2, title: 'Design cozy micro-interactions', category: 'Work', status: 'completed' }
];

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const categoryInput = document.getElementById('categoryInput');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const pendingList = document.getElementById('pendingList');
const completedList = document.getElementById('completedList');
const listContainers = document.querySelectorAll('.task-list');
const statPending = document.getElementById('statPending');
const statCompleted = document.getElementById('statCompleted');
const statTotal = document.getElementById('statTotal');
const headerPendingCount = document.getElementById('headerPendingCount');
const headerCompletedCount = document.getElementById('headerCompletedCount');
const toast = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');


let toastTimeout = null;
function showToast(msg) {
  clearTimeout(toastTimeout);
  toastMessage.innerText = msg;
  toast.classList.add('show');
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

const emptyCoffeeSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" /></svg>`;
const emptySparklesSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /></svg>`;

function getEmptyStateHTML(status) {
  if (status === 'pending') {
    return `<div class="empty-state">${emptyCoffeeSVG}<p>All caught up! Time for a warm beverage break.</p></div>`;
  }
  return `<div class="empty-state">${emptySparklesSVG}<p>No resolved entries verified within workspace parameters yet.</p></div>`;
}

function renderTasks() {
  const query = searchInput.value.toLowerCase();
  const activeCat = filterCategory.value;

  pendingList.innerHTML = '';
  completedList.innerHTML = '';

  let pendingCount = 0;
  let completedCount = 0;

  tasks.forEach(task => {
    if (activeCat !== 'All' && task.category !== activeCat) return;
    if (query && !task.title.toLowerCase().includes(query)) return;

    const itemNode = document.createElement('div');
    itemNode.className = 'task-item';
    itemNode.setAttribute('draggable', 'true');
    itemNode.setAttribute('id', `task-${task.id}`);
    itemNode.setAttribute('aria-label', `Task: ${task.title}. Category: ${task.category}`);

    itemNode.innerHTML = `
  <div class="task-info">
    <h4>${escapeHTML(task.title)}</h4>
    <span class="task-category">${task.category}</span>
  </div>
  <div class="task-actions">
    <button class="task-btn toggle-action" aria-label="Toggle structural status flow step">
      ${task.status === 'pending' ?
        `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>` :
        `<svg viewBox="0 0 24 24"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>`}
    </button>
    <button class="task-btn delete-action" aria-label="Purge node mapping from matrix">
      <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
    </button>
  </div>
  `;

    itemNode.addEventListener('dragstart', handleDragStart);
    itemNode.addEventListener('dragend', handleDragEnd);
    itemNode.querySelector('.toggle-action').addEventListener('click', () => changeStatus(task.id));
    itemNode.querySelector('.delete-action').addEventListener('click', () => removeTask(task.id, itemNode));

    if (task.status === 'pending') {
      pendingList.appendChild(itemNode);
      pendingCount++;
    } else {
      completedList.appendChild(itemNode);
      completedCount++;
    }
  });

  if (pendingCount === 0) pendingList.innerHTML = getEmptyStateHTML('pending');
  if (completedCount === 0) completedList.innerHTML = getEmptyStateHTML('completed');

  statPending.innerText = pendingCount;
  statCompleted.innerText = completedCount;
  statTotal.innerText = tasks.length;
  headerPendingCount.innerText = pendingCount;
  headerCompletedCount.innerText = completedCount;
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

let draggedItemReference = null;

function handleDragStart(e) {
  draggedItemReference = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.id.replace('task-', ''));
}

function handleDragEnd() {
  this.classList.remove('dragging');
  listContainers.forEach(list => list.classList.remove('drag-over'));
  draggedItemReference = null;
}

listContainers.forEach(container => {
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  container.addEventListener('dragenter', function (e) {
    e.preventDefault();
    this.classList.add('drag-over');
  });

  container.addEventListener('dragleave', function () {
    this.classList.remove('drag-over');
  });

  container.addEventListener('drop', function (e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    const targetStatus = this.getAttribute('data-status');
    const taskId = parseInt(e.dataTransfer.getData('text/plain'));

    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask && targetTask.status !== targetStatus) {
      targetTask.status = targetStatus;
      renderTasks();
      showToast(`Task successfully dropped into ${targetStatus}.`);
    }
  });
});

function changeStatus(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = task.status === 'pending' ? 'completed' : 'pending';
    renderTasks();
    showToast(`Task moved to ${task.status}.`);
  }
}

function removeTask(id, element) {
  element.classList.add('fade-out');
  element.addEventListener('transitionend', () => {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
    showToast("Task removed from board.");
  }, { once: true });
}

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = taskInput.value.trim();
  if (!value) return;

  tasks.push({
    id: Date.now(),
    title: value,
    category: categoryInput.value,
    status: 'pending'
  });

  taskInput.value = '';
  updatePropsUI();
  renderTasks();
  showToast("New task successfully created!");
});

searchInput.addEventListener('input', renderTasks);
filterCategory.addEventListener('change', renderTasks);

document.getElementById('clearFiltersBtn').addEventListener('click', () => {
  searchInput.value = '';
  filterCategory.value = 'All';
  renderTasks();
  showToast("Search filters reset.");
});

document.getElementById('clearTasksBtn').addEventListener('click', () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    tasks = [];
    renderTasks();
    showToast("All board entries deleted.");
  }
});

renderTasks();


const propValueEl = document.getElementById('propValue');
const attrValueEl = document.getElementById('attrValue');
const hasAttrValEl = document.getElementById('hasAttrVal');

function updatePropsUI() {
  propValueEl.innerText = `"${taskInput.value}"`;
  const currentAttr = taskInput.getAttribute('value');
  attrValueEl.innerText = currentAttr === null ? 'null' : `"${currentAttr}"`;
  hasAttrValEl.innerText = taskInput.hasAttribute('data-demo');
}

taskInput.addEventListener('input', updatePropsUI);

document.getElementById('setAttrBtn').addEventListener('click', () => {
  taskInput.setAttribute('value', taskInput.value || 'Fallback Default Pattern');
  taskInput.setAttribute('data-demo', 'true');
  updatePropsUI();
  showToast("HTML DOM Attribute mapped.");
});

document.getElementById('removeAttrBtn').addEventListener('click', () => {
  taskInput.removeAttribute('value');
  taskInput.removeAttribute('data-demo');
  updatePropsUI();
  showToast("HTML DOM Attribute purged.");
});

updatePropsUI();


const gpBox = document.getElementById('grandparentBox');
const pBox = document.getElementById('parentBox');
const cBtn = document.getElementById('childBtn');
const propLog = document.getElementById('propLog');

function executeVisualPropagationCycle(handlingSequenceArray) {
  propLog.innerHTML = '';
  handlingSequenceArray.forEach((node, stepIdx) => {
    setTimeout(() => {
      if (node.el !== cBtn) {
        node.el.classList.add('active-bubble');
        setTimeout(() => node.el.classList.remove('active-bubble'), 550);
      } else {
        node.el.style.transform = "scale(1.05)";
        setTimeout(() => node.el.style.transform = "none", 550);
      }

      const lineNode = document.createElement('div');
      lineNode.innerHTML = `⚡ Step ${stepIdx + 1}: Captured inside <span style="color:var(--accent-primary); font-weight:bold;">${node.name}</span> context block scope.`;
      propLog.appendChild(lineNode);
    }, stepIdx * 700);
  });
}

document.getElementById('runBubblingBtn').addEventListener('click', () => {
  executeVisualPropagationCycle([
    { el: cBtn, name: 'Child Node Element' },
    { el: pBox, name: 'Parent Structural Element' },
    { el: gpBox, name: 'Grandparent Context Scope' }
  ]);
  showToast("Bubbling simulation active.");
});

document.getElementById('runCapturingBtn').addEventListener('click', () => {
  executeVisualPropagationCycle([
    { el: gpBox, name: 'Grandparent Context Scope' },
    { el: pBox, name: 'Parent Structural Element' },
    { el: cBtn, name: 'Child Node Element' }
  ]);
  showToast("Capturing simulation active.");
});


const pipelineContainer = document.getElementById('pipelineContainer');
const pipelineDescTitle = document.getElementById('pipelineDescTitle');
const pipelineDescText = document.getElementById('pipelineDescText');
const setupSteps = document.querySelectorAll('.pipeline-step');

pipelineContainer.addEventListener('click', (e) => {
  const matchedStep = e.target.closest('.pipeline-step');
  if (matchedStep) {
    setupSteps.forEach(s => s.classList.remove('active'));
    matchedStep.classList.add('active');

    const title = matchedStep.getAttribute('data-title');
    const desc = matchedStep.getAttribute('data-desc');

    pipelineDescTitle.innerText = title;
    pipelineDescText.innerText = desc;
    showToast(`Inspecting step: ${title}`);
  }
});