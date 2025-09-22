document.addEventListener('DOMContentLoaded', function() {

            // DOM Elements
            const taskForm = document.getElementById('task-form');
            const taskTitle = document.getElementById('task-title');
            const taskDesc = document.getElementById('task-desc');
            const taskDate = document.getElementById('task-date');
            const taskPriority = document.getElementById('task-priority');
            const taskList = document.getElementById('task-list');
            const taskCount = document.getElementById('task-count');
            const clearCompletedBtn = document.getElementById('clear-completed');
            const filterButtons = document.querySelectorAll('.filter-btn');
            const priorityFilter = document.getElementById('priority-filter');
            const searchInput = document.getElementById('search-input');
            const darkModeToggle = document.getElementById('dark-mode-toggle');

            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            let currentFilter = 'all';
            let currentPriorityFilter = '';
            let currentSearch = '';

            // Set today's date as default
            const today = new Date().toISOString().split('T')[0];
            taskDate.value = today;

            // Load Theme
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            darkModeToggle.checked = savedTheme === 'dark';

            // Load Tasks
            renderTasks();

            // =============================
            // EVENT LISTENERS
            // =============================

            // Add Task
            taskForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const title = taskTitle.value.trim();
                if (!title) return;

                const newTask = {
                    id: Date.now(),
                    title: title,
                    description: taskDesc.value.trim(),
                    dueDate: taskDate.value,
                    priority: taskPriority.value,
                    completed: false,
                    createdAt: new Date().toISOString()
                };

                tasks.push(newTask);
                saveTasks();
                renderTasks();

                // Reset Form
                taskForm.reset();
                taskDate.value = today;
            });

            // Toggle Dark Mode
            darkModeToggle.addEventListener('change', function() {
                const theme = this.checked ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
            });

            // Filter Tasks
            filterButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    filterButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentFilter = this.dataset.filter;
                    renderTasks();
                });
            });

            // Priority Filter
            priorityFilter.addEventListener('change', function() {
                currentPriorityFilter = this.value;
                renderTasks();
            });

            // Search
            searchInput.addEventListener('input', function() {
                currentSearch = this.value.toLowerCase();
                renderTasks();
            });

            // Clear Completed
            clearCompletedBtn.addEventListener('click', function() {
                tasks = tasks.filter(task => !task.completed);
                saveTasks();
                renderTasks();
            });

            // =============================
            // FUNCTIONS
            // =============================

            function renderTasks() {
                const filteredTasks = tasks.filter(task => {
                    // Filter by status
                    if (currentFilter === 'active' && task.completed) return false;
                    if (currentFilter === 'completed' && !task.completed) return false;

                    // Filter by priority
                    if (currentPriorityFilter && task.priority !== currentPriorityFilter) return false;

                    // Filter by search
                    if (currentSearch && !task.title.toLowerCase().includes(currentSearch) &&
                        !task.description.toLowerCase().includes(currentSearch)) {
                        return false;
                    }

                    return true;
                });

                if (filteredTasks.length === 0) {
                    taskList.innerHTML = `<div id="empty-state">No tasks found. Add a new task!</div>`;
                } else {
                    taskList.innerHTML = filteredTasks.map(task => `
                <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <div class="task-header">
                        <span class="task-title">${task.title}</span>
                        <span class="task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                    </div>
                    ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
                    <div class="task-meta">
                        <span>Due: ${formatDate(task.dueDate)}</span>
                        <div class="task-actions">
                            <button class="btn-complete" onclick="toggleComplete(${task.id})">
                                ${task.completed ? 'Undo' : 'Complete'}
                            </button>
                            <button class="btn-edit" onclick="editTask(${task.id})">Edit</button>
                            <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
                        </div>
                    </div>
                </li>
            `).join('');
        }

        updateTaskCount();
    }

    function toggleComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            taskTitle.value = task.title;
            taskDesc.value = task.description;
            taskDate.value = task.dueDate;
            taskPriority.value = task.priority;

            // Delete old task
            deleteTask(id, false);
        }
    }

    function deleteTask(id, render = true) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        if (render) renderTasks();
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateTaskCount() {
        const activeTasks = tasks.filter(t => !t.completed).length;
        taskCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
    }

    function formatDate(dateString) {
        if (!dateString) return 'No date';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Expose functions to global scope for inline onclick
    window.toggleComplete = toggleComplete;
    window.editTask = editTask;
    window.deleteTask = deleteTask;
});
