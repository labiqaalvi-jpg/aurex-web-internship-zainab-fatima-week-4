// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const priorityInput = document.getElementById('priority-input');
const errorMsg = document.getElementById('error-msg');
const taskList = document.getElementById('task-list');
const totalCount = document.getElementById('total-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('empty-state');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const btnText = document.getElementById('btn-text');

// App State
let tasks = JSON.parse(localStorage.getItem('aurex_tasks')) || [];
let currentFilter = 'all';
let editModeId = null;

// Initialize
taskForm.addEventListener('submit', handleFormSubmit);
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderTasks();
    });
});

renderTasks();

// Form Submit Handler (Add / Update)
function handleFormSubmit(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    const priority = priorityInput.value;

    if (text === '') {
        errorMsg.textContent = '⚠️ Please enter a task description before adding!';
        return;
    }
    errorMsg.textContent = '';

    if (editModeId !== null) {
        // Edit existing task
        tasks = tasks.map(task => {
            if (task.id === editModeId) {
                return { ...task, text, priority };
            }
            return task;
        });
        editModeId = null;
        btnText.textContent = 'Add Task';
    } else {
        // Create new task
        const newTask = {
            id: Date.now(),
            text,
            priority,
            completed: false
        };
        tasks.push(newTask);
    }

    taskInput.value = '';
    saveAndRender();
}

// Render Tasks
function renderTasks() {
    taskList.innerHTML = '';

    let filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-info">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span class="task-text">${escapeHTML(task.text)}</span>
                <span class="badge badge-${task.priority}">${task.priority}</span>
            </div>
            <div class="task-actions">
                <button class="action-btn edit-btn" onclick="editTask(${task.id})" title="Edit Task"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete Task"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        taskList.appendChild(li);
    });

    updateStats();
}

// Toggle Completed State
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRender();
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    if (editModeId === id) {
        editModeId = null;
        taskInput.value = '';
        btnText.textContent = 'Add Task';
    }
    saveAndRender();
}

// Edit Task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        taskInput.value = task.text;
        priorityInput.value = task.priority;
        editModeId = id;
        btnText.textContent = 'Update';
        taskInput.focus();
    }
}

// Update Stats & Progress Bar
function updateStats() {
    totalCount.textContent = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const percentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% Completed (${completedCount}/${tasks.length})`;
}

// Save to LocalStorage & Render
function saveAndRender() {
    localStorage.setItem('aurex_tasks', JSON.stringify(tasks));
    renderTasks();
}

// Security Helper
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
                }
                          
