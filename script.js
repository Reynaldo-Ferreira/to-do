// Array para armazenar as tarefas
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentEditingId = null;
let modal = null;

// Inicializar o modal do Bootstrap quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    modal = new bootstrap.Modal(document.getElementById('editModal'));
});

// Função para adicionar uma nova tarefa
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    
    if (taskInput.value.trim() === '') {
        showToast('Por favor, digite uma tarefa!', 'error');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskInput.value,
        priority: prioritySelect.value,
        date: new Date().toISOString(),
        completed: false
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    updateStats();
    taskInput.value = '';
    showToast('Tarefa adicionada com sucesso!', 'success');
}

// Função para salvar as tarefas no localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Função para renderizar as tarefas
function renderTasks() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    const filterPriority = document.getElementById('filterPriority').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase();

    const filteredTasks = tasks.filter(task => {
        const matchesPriority = filterPriority === 'todas' || task.priority === filterPriority;
        const matchesSearch = task.text.toLowerCase().includes(searchText);
        return matchesPriority && matchesSearch;
    });

    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `todo-item ${task.priority} ${task.completed ? 'completed' : ''}`;
        
        const date = new Date(task.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        taskElement.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" ${task.completed ? 'checked' : ''} 
                    onchange="toggleComplete(${task.id})">
                <span>${task.text}</span>
                <small class="task-date">${date}</small>
            </div>
            <div class="actions">
                <button class="btn btn-sm btn-warning" onclick="openEditModal(${task.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;

        todoList.appendChild(taskElement);
    });

    updateStats();
}

// Função para alternar o estado de conclusão da tarefa
function toggleComplete(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
    }
}

// Função para atualizar estatísticas
function updateStats() {
    const totalTasks = tasks.length;
    const priorityCount = {
        baixa: tasks.filter(t => t.priority === 'baixa').length,
        media: tasks.filter(t => t.priority === 'media').length,
        alta: tasks.filter(t => t.priority === 'alta').length
    };

    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('priorityStats').innerHTML = `
        <span class="badge bg-success">Baixa: ${priorityCount.baixa}</span>
        <span class="badge bg-warning">Média: ${priorityCount.media}</span>
        <span class="badge bg-danger">Alta: ${priorityCount.alta}</span>
    `;
}

// Função para filtrar tarefas
function filterTasks() {
    renderTasks();
}

// Função para excluir uma tarefa
function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (confirm(`Tem certeza que deseja excluir a tarefa "${task.text}"?`)) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        showToast('Tarefa excluída com sucesso!', 'success');
    }
}

// Função para abrir o modal de edição
function openEditModal(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    currentEditingId = id;
    const editTaskInput = document.getElementById('editTaskInput');
    const editPrioritySelect = document.getElementById('editPrioritySelect');

    editTaskInput.value = task.text;
    editPrioritySelect.value = task.priority;
    modal.show();
}

// Função para salvar a edição
function saveEdit() {
    if (currentEditingId === null) return;

    const editTaskInput = document.getElementById('editTaskInput');
    const editPrioritySelect = document.getElementById('editPrioritySelect');

    if (editTaskInput.value.trim() === '') {
        showToast('Por favor, digite uma tarefa!', 'error');
        return;
    }

    const taskIndex = tasks.findIndex(task => task.id === currentEditingId);
    if (taskIndex !== -1) {
        tasks[taskIndex].text = editTaskInput.value;
        tasks[taskIndex].priority = editPrioritySelect.value;
        saveTasks();
        renderTasks();
        modal.hide();
        showToast('Tarefa atualizada com sucesso!', 'success');
    }
}

// Função para exibir toast de notificação
function showToast(message, type = 'info') {
    const toastDiv = document.createElement('div');
    toastDiv.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0 position-fixed bottom-0 end-0 m-3`;
    toastDiv.setAttribute('role', 'alert');
    toastDiv.setAttribute('aria-live', 'assertive');
    toastDiv.setAttribute('aria-atomic', 'true');

    toastDiv.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    document.body.appendChild(toastDiv);
    const toast = new bootstrap.Toast(toastDiv);
    toast.show();

    toastDiv.addEventListener('hidden.bs.toast', () => {
        toastDiv.remove();
    });
}

// Carregar tarefas ao iniciar a página
renderTasks();

// Adicionar tarefa ao pressionar Enter
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});
