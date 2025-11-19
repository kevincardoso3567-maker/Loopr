// analises.js — VERSÃO FINAL OFICIAL LOOPR 2025
let tasks = [];
let currentMonth = new Date();

const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

document.addEventListener('DOMContentLoaded', () => {
    currentMonth.setDate(1); // sempre começa no dia 1
    loadTasks();
    setupNavigation();
    updateView();
    initMonthComparator(); // nova função
});

function loadTasks() {
    const data = localStorage.getItem('tasks');
    tasks = data ? JSON.parse(data) : [];
}

function setupNavigation() {
    document.getElementById('prevMonth').onclick = () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        updateView();
    };
    document.getElementById('nextMonth').onclick = () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        updateView();
    };
}

function updateView() {
    loadTasks();

    document.getElementById('monthTitle').textContent = 
        currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const weeks = getWeeksOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    renderWeeks(weeks);
    updateSummary(weeks);
}

// ===================================
// ANÁLISE SEMANAL (seu código perfeito)
// ===================================
function getWeeksOfMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const weeks = [];
    
    let weekStart = new Date(firstDay);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    let weekNumber = 1;

    while (weekStart <= lastDay) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        if (weekStart.getTime() > lastDay.getTime()) break;

        const weekTasks = tasks.filter(t => {
            const taskDate = new Date(t.date + 'T12:00:00');
            const inRange = taskDate >= weekStart && taskDate <= weekEnd;
            const inMonth = taskDate.getMonth() === month && taskDate.getFullYear() === year;
            return inRange && inMonth;
        });

        const completed = weekTasks.filter(t => t.completed).length;
        const total = weekTasks.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        if (total > 0) {
            weeks.push({
                number: weekNumber++,
                start: weekStart.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}),
                end: weekEnd.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}),
                completed,
                total,
                percent
            });
        }

        weekStart.setDate(weekStart.getDate() + 7);
    }
    return weeks;
}

function renderWeeks(weeks) {
    const container = document.getElementById('weeksContainer');

    if (weeks.length === 0) {
        container.innerHTML = '<p class="sub-text-label" style="grid-column:1/-1;text-align:center;margin:3rem 0;">Nenhuma tarefa neste mês ainda.</p>';
        return;
    }

    const best = weeks.reduce((a,b) => a.percent >= b.percent ? a : b);

    container.innerHTML = weeks.map(w => `
        <div class="week-box ${w.percent === best.percent ? 'best' : ''}">
            <h3>Semana ${w.number}</h3>
            <div class="percent">${w.percent}%</div>
            <div class="details">${w.completed} de ${w.total} concluídas</div>
            <small>${w.start} - ${w.end}</small>
        </div>
    `).join('');
}

function updateSummary(weeks) {
    if (weeks.length === 0) {
        document.getElementById('bestWeek').textContent = '-';
        document.getElementById('monthAverage').textContent = '0%';
        document.getElementById('totalTasks').textContent = '0';
        return;
    }

    const best = weeks.reduce((a,b) => a.percent >= b.percent ? a : b);
    const totalTasks = weeks.reduce((s,w) => s + w.total, 0);
    const avg = Math.round(weeks.reduce((s,w) => s + w.percent, 0) / weeks.length);

    document.getElementById('bestWeek').textContent = `Semana ${best.number} (${best.percent}%)`;
    document.getElementById('monthAverage').textContent = `${avg}%`;
    document.getElementById('totalTasks').textContent = totalTasks;
}

// ===================================
// COMPARADOR DE MESES (NOVA FUNCIONALIDADE)
// ===================================
function populateMonthSelectors() {
    const select1 = document.getElementById('month1');
    const select2 = document.getElementById('month2');
    select1.innerHTML = '';
    select2.innerHTML = '';

    const currentYear = new Date().getFullYear();
    for (let y = 2024; y <= currentYear + 1; y++) {
        for (let m = 0; m < 12; m++) {
            const value = `${y}-${String(m + 1).toString().padStart(2, '0')}`;
            const text = `${monthNames[m]} ${y}`;

            const opt1 = new Option(text, value);
            const opt2 = new Option(text, value);
            select1.add(opt1);
            select2.add(opt2);
        }
    }

    // padrão: mês anterior × mês atual
    const thisMonth = `${currentYear}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    const prevMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

    select1.value = prevMonth;
    select2.value = thisMonth;
}

function getMonthPerformance(year, monthIndex) {
    const first = new Date(year, monthIndex, 1);
    const last = new Date(year, monthIndex + 1, 0);

    const monthTasks = tasks.filter(t => {
        const d = new Date(t.date);
        return d >= first && d <= last;
    });

    const completed = monthTasks.filter(t => t.completed).length;
    const total = monthTasks.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { percent, completed, total };
}

function updateComparison() {
    const [y1, m1] = document.getElementById('month1').value.split('-').map(Number);
    const [y2, m2] = document.getElementById('month2').value.split('-').map(Number);

    const perf1 = getMonthPerformance(y1, m1 - 1);
    const perf2 = getMonthPerformance(y2, m2 - 1);

    const name1 = `${monthNames[m1-1]} ${y1}`;
    const name2 = `${monthNames[m2-1]} ${y2}`;

    const result = document.getElementById('comparisonResult');

    if (perf1.total === 0 && perf2.total === 0) {
        result.innerHTML = `<p class="sub-text-label">Nenhum dado nos dois meses.</p>`;
        return;
    }

    if (perf1.percent > perf2.percent) {
        const diff = perf1.percent - perf2.percent;
        result.innerHTML = `
            <div class="winner">${name1} VENCEU!</div>
            <p style="font-size:1.7rem;color:white;margin:1rem 0;">${perf1.percent}% × ${perf2.percent}%</p>
            <p style="color:var(--sub-text-color);">${name1} foi <strong>${diff}% melhor</strong><br>
            (${perf1.completed}/${perf1.total} tarefas concluídas)</p>`;
    } else if (perf2.percent > perf1.percent) {
        const diff = perf2.percent - perf1.percent;
        result.innerHTML = `
            <div class="winner">${name2} VENCEU!</div>
            <p style="font-size:1.7rem;color:white;margin:1rem 0;">${perf2.percent}% × ${perf1.percent}%</p>
            <p style="color:var(--sub-text-color);">${name2} foi <strong>${diff}% melhor</strong><br>
            (${perf2.completed}/${perf2.total} tarefas concluídas)</p>`;
    } else {
        result.innerHTML = `
            <div class="tie">EMPATE PERFEITO!</div>
            <p style="font-size:1.7rem;color:white;margin:1rem 0;">${perf1.percent}% em ambos</p>`;
    }
}

function initMonthComparator() {
    populateMonthSelectors();
    document.getElementById('month1').addEventListener('change', updateComparison);
    document.getElementById('month2').addEventListener('change', updateComparison);
    updateComparison();
}