// ====================================================================
//            VARIÁVEIS GLOBAIS
// ====================================================================

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentDate = new Date();
let selectedDate = new Date();

let timerInterval, timerElapsedTime = 0, isRunning = false, isStopwatchMode = true;

// ====================================================================
//            UTILIDADES
// ====================================================================

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function saveTasks() { localStorage.setItem('tasks', JSON.stringify(tasks)); }

// ====================================================================
//            PROGRESSO CIRCULAR
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
//            NAVEGAÇÃO POR ABAS (ESTUDOS IGNORADO)
// ====================================================================

function setupTabNavigation() {
    const buttons = document.querySelectorAll('.sidebar .nav-button[data-tab]');
    const contents = document.querySelectorAll('.tab-content');

    const switchTab = (id) => {
        if (id === 'estudos') return;
        buttons.forEach(b => b.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        document.getElementById(id)?.classList.add('active');
        document.querySelector(`[data-tab="${id}"]`)?.classList.add('active');
    };

    buttons.forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
    switchTab('rotina');
}

// ====================================================================
//            CALENDÁRIO E TAREFAS
// ====================================================================

function renderCalendar() {
    const display = document.getElementById('currentMonthYear');
    const grid = document.getElementById('calendarGrid');
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
            dot.style.cssText = 'width:4px;height:4px;border-radius:50%;background:var(--accent-color);position:absolute;bottom:4px;';
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
        list.innerHTML = `<li style="color:var(--sub-text-color);font-style:italic;margin-top:1rem;">Nenhuma tarefa.</li>`;
        return;
    }

    dayTasks.forEach((task, i) => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' completed' : '');

        const normalHTML = `
            <span class="task-title" data-index="${i}">${task.title}</span>
            <button class="task-toggle-img" data-index="${i}">
                <img src="${task.completed ? 'assets/CK.png' : 'assets/AN.png'}" 
                     alt="${task.completed ? 'Concluída' : 'Pendente'}" 
                     class="task-status-icon"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="fallback-icon" style="display:none;">
                    <i class="${task.completed ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle'}" 
                       style="color:${task.completed ? 'limegreen' : 'var(--accent-color)'};"></i>
                </div>
            </button>
        `;

        li.innerHTML = normalHTML;

        const titleSpan = li.querySelector('.task-title');
        titleSpan.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            enterEditMode(li, i, task.title, key, dayTasks);
        });

        li.querySelector('.task-toggle-img').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTask(i, key, dayTasks);
        });

        list.appendChild(li);
    });

    function enterEditMode(li, index, currentTitle, key, dayTasks) {
        li.innerHTML = `
            <input type="text" class="edit-input" value="${currentTitle}" autofocus>
            <button class="task-delete-img" data-index="${index}">
                <img src="assets/X.png" alt="Excluir" class="task-status-icon">
            </button>
            <button class="save-edit-btn">Salvar</button>
        `;

        const input = li.querySelector('.edit-input');
        input.select();

        const save = () => {
            const newTitle = input.value.trim();
            if (!newTitle) return deleteTask(li, index, key, dayTasks);
            const globalIdx = tasks.findIndex(t => t.title === dayTasks[index].title && t.date === key);
            if (globalIdx !== -1) {
                tasks[globalIdx].title = newTitle;
                saveTasks();
                renderTasks();
                renderCalendar();
            }
        };

        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') renderTasks();
        });

        li.querySelector('.save-edit-btn').addEventListener('click', save);
        li.querySelector('.task-delete-img').addEventListener('click', () => deleteTask(li, index, key, dayTasks));

        const clickOutside = (e) => {
            if (!li.contains(e.target)) {
                renderTasks();
                document.removeEventListener('click', clickOutside);
            }
        };
        setTimeout(() => document.addEventListener('click', clickOutside), 0);
    }

    function deleteTask(li, index, key, dayTasks) {
        if (!confirm('Excluir tarefa?')) return;
        const globalIdx = tasks.findIndex(t => t.title === dayTasks[index].title && t.date === key);
        if (globalIdx !== -1) {
            tasks.splice(globalIdx, 1);
            saveTasks();
            renderTasks();
            renderCalendar();
        }
    }

    function toggleTask(index, key, dayTasks) {
        const globalIdx = tasks.findIndex(t => t.title === dayTasks[index].title && t.date === key);
        if (globalIdx !== -1) {
            tasks[globalIdx].completed = !tasks[globalIdx].completed;
            saveTasks();
            renderTasks();
        }
    }
}

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

// ====================================================================
//            TIMER
// ====================================================================

function formatTime(sec) {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function timerTick() {
    const display = document.getElementById('timerDisplay');
    const btn = document.getElementById('startStopTimer');
    if (isStopwatchMode) {
        timerElapsedTime++;
        display.textContent = formatTime(timerElapsedTime);
    } else {
        timerElapsedTime--;
        display.textContent = formatTime(timerElapsedTime);
        if (timerElapsedTime <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            btn.innerHTML = 'Iniciar';
            btn.classList.remove('running');
            display.textContent = "00:00:00";
            alert("Foco finalizado!");
        }
    }
}

function startStopTimer() {
    const btn = document.getElementById('startStopTimer');
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        btn.innerHTML = 'Continuar';
        btn.classList.remove('running');
    } else {
        if (timerElapsedTime === 0 && !isStopwatchMode) {
            timerElapsedTime = (parseInt(document.getElementById('countdownInput').value) || 25) * 60;
        }
        timerInterval = setInterval(timerTick, 1000);
        isRunning = true;
        btn.innerHTML = 'Pausar';
        btn.classList.add('running');
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timerElapsedTime = 0;
    const display = document.getElementById('timerDisplay');
    const btn = document.getElementById('startStopTimer');
    btn.innerHTML = 'Iniciar';
    btn.classList.remove('running');
    display.textContent = isStopwatchMode ? "00:00:00" : formatTime((parseInt(document.getElementById('countdownInput').value) || 25) * 60);
}

function switchTimerMode(stopwatch) {
    isStopwatchMode = stopwatch;
    resetTimer();
    document.getElementById('countdownInputGroup').style.display = stopwatch ? 'none' : 'flex';
    document.getElementById('modeStopwatch').classList.toggle('active', stopwatch);
    document.getElementById('modeCountdown').classList.toggle('active', !stopwatch);
}

function setupTimerControls() {
    document.getElementById('startStopTimer').addEventListener('click', startStopTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);
    document.getElementById('modeStopwatch').addEventListener('click', () => switchTimerMode(true));
    document.getElementById('modeCountdown').addEventListener('click', () => switchTimerMode(false));
    switchTimerMode(true);
}

// ====================================================================
//            INICIALIZAÇÃO
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    renderTasks();
    document.getElementById('addTaskButton').addEventListener('click', addTask);
    setupTimerControls();
    setupTabNavigation();
});