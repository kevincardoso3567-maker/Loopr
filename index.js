// ====================================================================
// LOOPR - SCRIPT PRINCIPAL (2025) - VERSÃO FINALÍSSIMA CORRIGIDA
// ====================================================================

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentDate = new Date();
let selectedDate = new Date();
let timerInterval, timerElapsedTime = 0, isRunning = false, isStopwatchMode = true; 

// ====================================================================
// UTILIDADES
// ====================================================================
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ====================================================================
// PROGRESSO CIRCULAR
// ====================================================================
function updateCircularProgress(percentage, completedCount) {
    const ring = document.querySelector('.progress-ring__progress');
    const value = document.getElementById('progressDisplayLarge');
    const count = document.getElementById('completedCountDisplay');
    if (!ring || !value || !count) return;
    value.textContent = `${percentage}%`;
    count.textContent = completedCount;
    const circumference = 2 * Math.PI * 86;
    const offset = circumference - (percentage / 100) * circumference;
    ring.style.strokeDashoffset = offset;
}

// ====================================================================
// CALENDÁRIO
// ====================================================================
function renderCalendar() {
    const display = document.getElementById('currentMonthYear');
    const grid = document.getElementById('calendarGrid');
    
    currentDate.setDate(1); 
    
    display.textContent = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    while (grid.children.length > 7) grid.removeChild(grid.lastChild);
    
    const year = currentDate.getFullYear(), month = currentDate.getMonth();
    const first = new Date(year, month, 1), last = new Date(year, month + 1, 0);
    const startDay = first.getDay();
    
    for (let i = 0; i < startDay; i++) {
        grid.appendChild(document.createElement('div')).className = 'day-cell empty';
    }
    
    const taskDates = new Set(tasks.map(t => t.date));
    
    for (let day = 1; day <= last.getDate(); day++) {
        const date = new Date(year, month, day);
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.textContent = day;
        cell.dataset.date = formatDateKey(date);
        
        if (isSameDay(date, new Date())) cell.classList.add('today');
        if (isSameDay(date, selectedDate)) cell.classList.add('selected');
        
        if (taskDates.has(cell.dataset.date)) {
            const dot = document.createElement('div');
            dot.style.cssText = 'width:4px;height:4px;border-radius:50%;background:var(--accent-color);position:absolute;bottom:4px;left:50%;transform:translateX(-50%);';
            cell.appendChild(dot);
        }
        
        cell.addEventListener('click', () => {
            document.querySelectorAll('.day-cell.selected').forEach(c => c.classList.remove('selected'));
            cell.classList.add('selected');
            selectedDate = date;
            renderTasks();
        });
        
        grid.appendChild(cell);
    }
    
    document.getElementById('prevMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
    document.getElementById('nextMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
}

// ====================================================================
// LÓGICA DE AÇÕES DE TAREFAS
// ====================================================================

function deleteTask(globalIndex) {
    if (!tasks[globalIndex]) return; 

    if (!confirm('Tem certeza que quer excluir essa tarefa?')) return;
    
    tasks.splice(globalIndex, 1);
    saveTasks();
    renderTasks();
    renderCalendar();
}

function toggleTask(globalIndex) {
    if (!tasks[globalIndex]) return; 
    
    tasks[globalIndex].completed = !tasks[globalIndex].completed;
    saveTasks();
    renderTasks();
}

// ====================================================================
// RENDERIZAR TAREFAS
// ====================================================================
function renderTasks() {
    const list = document.getElementById('taskListItems');
    const dayName = document.getElementById('selectedDayName');
    const dateDisplay = document.getElementById('selectedDateDisplay');
    list.innerHTML = '';
    
    dayName.textContent = selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' });
    dateDisplay.textContent = selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    const key = formatDateKey(selectedDate);
    const dayTasks = tasks.filter(t => t.date === key); 
    
    const completed = dayTasks.filter(t => t.completed).length;
    const total = dayTasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    updateCircularProgress(progress, completed);

    if (total === 0) {
        list.innerHTML = `<li style="color:var(--sub-text-color);font-style:italic;margin-top:1rem;text-align:center;">Nenhuma tarefa hoje.</li>`;
        return;
    }

    dayTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' completed' : '');
        
        const globalIndex = tasks.findIndex(t => t === task);

        // HTML CORRIGIDO: Garante que os dois botões estão no contêiner 'task-actions'
        li.innerHTML = `
            <span class="task-title" data-index="${globalIndex}">${task.title}</span>
            <div class="task-actions">
                <button class="task-toggle-img" data-index="${globalIndex}" title="${task.completed ? 'Desmarcar como pendente' : 'Marcar como concluída'}">
                    <img src="${task.completed ? 'CK.png' : 'AN.png'}"
                         alt="${task.completed ? 'Concluída' : 'Pendente'}"
                         class="task-status-icon">
                </button>
                <button class="task-delete-img" data-index="${globalIndex}" title="Excluir tarefa">
                    <img src="X.png" alt="Excluir" class="task-status-icon">
                </button>
            </div>
        `;

        const titleSpan = li.querySelector('.task-title');
        const toggleBtn = li.querySelector('.task-toggle-img');
        const deleteBtn = li.querySelector('.task-delete-img'); // <--- Este elemento agora está presente no HTML

        titleSpan.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            enterEditMode(li, globalIndex, task.title);
        });

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTask(globalIndex); 
        });

        // Evento de exclusão ligado ao botão visível
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(globalIndex); 
        });

        list.appendChild(li);
    });

    // MODO EDIÇÃO
    function enterEditMode(li, globalIndex, currentTitle) {
        li.innerHTML = `
            <input type="text" class="edit-input" value="${currentTitle}" autofocus>
            <div class="task-actions edit-mode">
                <button class="task-delete-img" data-index="${globalIndex}" title="Excluir tarefa">
                    <img src="X.png" alt="Excluir" class="task-status-icon">
                </button>
                <button class="save-edit-btn">Salvar</button>
            </div>
        `;

        const input = li.querySelector('.edit-input');
        const saveBtn = li.querySelector('.save-edit-btn');
        const deleteBtn = li.querySelector('.task-delete-img');

        input.select();

        const save = () => {
            const newTitle = input.value.trim();
            if (!newTitle) {
                deleteTask(globalIndex);
                return;
            }
            if (tasks[globalIndex]) {
                tasks[globalIndex].title = newTitle;
                saveTasks();
                renderTasks();
                renderCalendar();
            }
        };

        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') renderTasks();
        });

        saveBtn.addEventListener('click', save);
        // O deleteBtn também precisa do listener aqui para funcionar no modo edição
        deleteBtn.addEventListener('click', () => deleteTask(globalIndex));

        const clickOutside = (e) => {
            if (!li.contains(e.target)) {
                save();
                document.removeEventListener('click', clickOutside);
            }
        };
        setTimeout(() => document.addEventListener('click', clickOutside), 0);
    }
}

// ====================================================================
// ADICIONAR TAREFA
// ====================================================================
function addTask() {
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    if (title) {
        tasks.push({ title, date: formatDateKey(selectedDate), completed: false });
        saveTasks();
        input.value = '';
        renderTasks();
        renderCalendar();
    }
}

// ... (Outras funções omitidas por brevidade, mas devem ser mantidas no seu arquivo)

// ====================================================================
// INICIALIZAÇÃO
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
    selectedDate = new Date();
    selectedDate.setHours(0, 0, 0, 0); 

    renderCalendar();
    renderTasks();

    const addTaskBtn = document.getElementById('addTaskButton');
    const taskInput = document.getElementById('taskInput');
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addTask);
    }
    if (taskInput) {
        taskInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') addTask();
        });
    }
});
