// static/script.js - Complete Frontend Functionality

// API Base URL
const API_BASE = 'http://127.0.0.1:8000';

// Current filter state
let currentFilter = 'all';

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('Frontend loaded!');
    
    // Dark Mode Toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.textContent = '☀️ Light Mode';
        }
        
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            // Save preference
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.textContent = '☀️ Light Mode';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggleBtn.textContent = '🌙 Dark Mode';
            }
        });
    }
    
    // Modal functionality
    const modal = document.getElementById('edit-modal');
    const closeBtn = document.querySelector('.close-modal');
    const editForm = document.getElementById('edit-form');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEditModal);
    }
    
    if (modal) {
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeEditModal();
            }
        });
    }
    
    if (editForm) {
        editForm.addEventListener('submit', updateTask);
    }
    
    // Load initial data
    loadTasks();
    loadStatistics();
    
    // Set up form submission
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', createTask);
    }
    
    // Set up filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Update filter and reload tasks
            currentFilter = e.target.dataset.filter;
            loadTasks();
        });
    });
    
    // Set up delete all button
    const deleteAllBtn = document.getElementById('delete-all-btn');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', deleteAllTasks);
    }
});

// ========== API FUNCTIONS ==========

/**
 * Load tasks from the API
 */
async function loadTasks() {
    try {
        const tasksList = document.getElementById('tasks-list');
        if (!tasksList) return;
        
        tasksList.innerHTML = '<p class="loading">Loading tasks...</p>';
        
        // Build URL with filter
        let url = `${API_BASE}/tasks`;
        if (currentFilter !== 'all') {
            const completed = currentFilter === 'completed';
            url += `?completed=${completed}`;
        }
        
        console.log('Fetching tasks from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tasks = await response.json();
        console.log('Tasks loaded:', tasks);
        
        displayTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        const tasksList = document.getElementById('tasks-list');
        if (tasksList) {
            tasksList.innerHTML = '<p class="empty-message">❌ Error loading tasks. Make sure the server is running.</p>';
        }
    }
}

/**
 * Load task statistics from the API
 */
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE}/tasks/stats`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stats = await response.json();
        console.log('Statistics loaded:', stats);
        
        // Update statistics cards
        const totalEl = document.getElementById('total-tasks');
        const completedEl = document.getElementById('completed-tasks');
        const pendingEl = document.getElementById('pending-tasks');
        const percentEl = document.getElementById('completion-percentage');
        
        if (totalEl) totalEl.textContent = stats.total_tasks || 0;
        if (completedEl) completedEl.textContent = stats.completed_tasks || 0;
        if (pendingEl) pendingEl.textContent = stats.pending_tasks || 0;
        if (percentEl) percentEl.textContent = (stats.completion_percentage || 0) + '%';
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

/**
 * Create a new task
 */
async function createTask(event) {
    event.preventDefault();
    
    const titleInput = document.getElementById('task-title');
    const descInput = document.getElementById('task-description');
    
    if (!titleInput) return;
    
    const title = titleInput.value.trim();
    const description = descInput ? descInput.value.trim() : '';
    
    if (!title) {
        alert('Title is required!');
        return;
    }
    
    try {
        console.log('Creating task:', { title, description });
        
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                description: description || null
            })
        });
        
        if (response.ok) {
            // Clear form
            titleInput.value = '';
            if (descInput) descInput.value = '';
            
            // Reload tasks and statistics
            await loadTasks();
            await loadStatistics();
            
            // Show success message (optional)
            console.log('Task created successfully');
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error creating task:', error);
        alert('Failed to create task. Is the server running?');
    }
}

/**
 * Update task status (complete/pending)
 */
async function updateTaskStatus(taskId, completed) {
    try {
        console.log(`Updating task ${taskId} to completed=${completed}`);
        
        const response = await fetch(`${API_BASE}/tasks/${taskId}?completed=${completed}`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            await loadTasks();
            await loadStatistics();
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Failed to update task');
    }
}

/**
 * Open edit modal with task data
 */
function openEditModal(task) {
    const modal = document.getElementById('edit-modal');
    const editId = document.getElementById('edit-task-id');
    const editTitle = document.getElementById('edit-task-title');
    const editDescription = document.getElementById('edit-task-description');
    
    if (modal && editId && editTitle && editDescription) {
        editId.value = task.id;
        editTitle.value = task.title;
        editDescription.value = task.description || '';
        modal.style.display = 'block';
        
        // Focus on title input
        setTimeout(() => editTitle.focus(), 100);
    }
}

/**
 * Close edit modal
 */
function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Update task via API
 */
async function updateTask(event) {
    event.preventDefault();
    
    const taskId = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value.trim();
    const description = document.getElementById('edit-task-description').value.trim();
    
    if (!title) {
        alert('Title is required!');
        return;
    }
    
    try {
        console.log(`Updating task ${taskId}:`, { title, description });
        
        // Build URL with parameters
        let url = `${API_BASE}/tasks/${taskId}?title=${encodeURIComponent(title)}`;
        if (description) {
            url += `&description=${encodeURIComponent(description)}`;
        }
        
        const response = await fetch(url, {
            method: 'PUT'
        });
        
        if (response.ok) {
            closeEditModal();
            await loadTasks();
            await loadStatistics();
            console.log('Task updated successfully');
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Failed to update task');
    }
}

/**
 * Delete a single task
 */
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        console.log(`Deleting task ${taskId}`);
        
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadTasks();
            await loadStatistics();
            console.log('Task deleted successfully');
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
    }
}

/**
 * Delete all tasks
 */
async function deleteAllTasks() {
    if (!confirm('⚠️ Are you ABSOLUTELY sure you want to delete ALL tasks? This cannot be undone!')) {
        return;
    }
    
    // Double confirmation for safety
    if (!confirm('This will permanently delete ALL your tasks. Continue?')) {
        return;
    }
    
    try {
        console.log('Deleting all tasks');
        
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadTasks();
            await loadStatistics();
            console.log('All tasks deleted successfully');
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting all tasks:', error);
        alert('Failed to delete all tasks');
    }
}

// ========== UI FUNCTIONS ==========

/**
 * Display tasks in the UI
 */
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;
    
    if (!tasks || tasks.length === 0) {
        tasksList.innerHTML = '<p class="empty-message">✨ No tasks yet. Create your first task above!</p>';
        return;
    }
    
    let html = '';
    tasks.forEach(task => {
        html += createTaskHTML(task);
    });
    
    tasksList.innerHTML = html;
    
    // Add event listeners to buttons
    tasks.forEach(task => {
        // Complete/Uncomplete button
        const toggleBtn = document.getElementById(`toggle-${task.id}`);
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                updateTaskStatus(task.id, !task.completed);
            });
        }
        
        // Edit button
        const editBtn = document.getElementById(`edit-${task.id}`);
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                openEditModal(task);
            });
        }
        
        // Delete button
        const deleteBtn = document.getElementById(`delete-${task.id}`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                deleteTask(task.id);
            });
        }
    });
}

/**
 * Create HTML for a single task
 */
function createTaskHTML(task) {
    const taskClass = task.completed ? 'task-item completed' : 'task-item';
    const buttonText = task.completed ? '↩️ Undo' : '✅ Complete';
    
    // Escape HTML to prevent XSS
    const safeTitle = escapeHTML(task.title);
    const safeDescription = escapeHTML(task.description) || 'No description';
    
    return `
        <div class="${taskClass}" id="task-${task.id}">
            <div class="task-info">
                <div class="task-title">${safeTitle}</div>
                <div class="task-description">${safeDescription}</div>
                <div class="task-id" style="font-size: 0.8em; color: #999; margin-top: 5px;">ID: ${task.id}</div>
            </div>
            <div class="task-actions">
                <button class="complete-btn" id="toggle-${task.id}">${buttonText}</button>
                <button class="edit-btn" id="edit-${task.id}">✏️ Edit</button>
                <button class="delete-btn" id="delete-${task.id}">🗑️ Delete</button>
            </div>
        </div>
    `;
}
/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHTML(str) {
    if (!str) return str;
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/`/g, '&#96;');
}
/**
 * Show a temporary notification (optional enhancement)
 */
function showNotification(message, type = 'info') {
    // You can implement this if you want toast notifications
    console.log(`[${type}] ${message}`);
}