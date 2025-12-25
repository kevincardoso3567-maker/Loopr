// foco.js - Loopr • Foco Pro (Versão Final Corrigida e Premium)

const state = {
    timer: {
        remaining: 0,
        total: 0,
        running: false,
        paused: false,
        interval: null
    },
    stopwatch: {
        startTime: 0,
        elapsed: 0,
        running: false,
        interval: null,
        lastLap: 0
    },
    alarms: JSON.parse(localStorage.getItem('loopr_alarms') || '[]')
};

// Som de notificação suave (funciona sem arquivo externo)
const notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAA');


// ======================== NAVEGAÇÃO POR ABAS ========================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.mode').forEach(m => m.classList.remove('active'));
        
        btn.classList.add('active');
        const modeId = btn.dataset.mode + '-mode';
        document.getElementById(modeId).classList.add('active');
    });
});


// ======================== RELÓGIO MUNDIAL ========================
function updateClock() {
    const now = new Date();

    // Horário principal
    document.getElementById('mainClock').textContent = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // Data
    document.getElementById('currentDate').textContent = now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase());

    // Horários mundiais
    const zones = {
        'time-ny': 'America/New_York',
        'time-lon': 'Europe/London',
        'time-tok': 'Asia/Tokyo'
    };

    Object.keys(zones).forEach(id => {
        const time = now.toLocaleTimeString('pt-BR', {
            timeZone: zones[id],
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById(id).textContent = time;
    });

    checkAlarms(now);
}

setInterval(updateClock, 1000);
updateClock();


// ======================== TIMER DE FOCO ========================
const timerDisplay = document.getElementById('timerDisplay');
const timerBar = document.getElementById('timerBar');
const timerSetup = document.getElementById('timer-setup');
const timerActive = document.getElementById('timer-active');
const btnTimerStart = document.getElementById('btn-timer-start');
const btnTimerReset = document.getElementById('btn-timer-reset');

btnTimerStart.addEventListener('click', () => {
    if (state.timer.running && !state.timer.paused) {
        // Pausar
        clearInterval(state.timer.interval);
        state.timer.paused = true;
        btnTimerStart.textContent = 'CONTINUAR';
        return;
    }

    // Iniciar ou continuar
    if (state.timer.remaining === 0) {
        const h = parseInt(document.getElementById('t-hour').value) || 0;
        const m = parseInt(document.getElementById('t-min').value) || 0;
        const s = parseInt(document.getElementById('t-sec').value) || 0;
        state.timer.remaining = h * 3600 + m * 60 + s;
        state.timer.total = state.timer.remaining;

        if (state.timer.remaining === 0) {
            alert('Defina um tempo válido!');
            return;
        }
    }

    timerSetup.style.display = 'none';
    timerActive.style.display = 'block';
    state.timer.running = true;
    state.timer.paused = false;
    btnTimerStart.textContent = 'PAUSAR';

    state.timer.interval = setInterval(() => {
        state.timer.remaining--;

        const h = Math.floor(state.timer.remaining / 3600);
        const m = Math.floor((state.timer.remaining % 3600) / 60);
        const s = state.timer.remaining % 60;

        timerDisplay.textContent = `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        timerBar.style.width = `${(state.timer.remaining / state.timer.total) * 100}%`;

        if (state.timer.remaining <= 0) {
            clearInterval(state.timer.interval);
            state.timer.running = false;
            notificationSound.play();
            alert('Foco concluído! Hora de descansar 💪');
            btnTimerReset.click();
        }
    }, 1000);
});

btnTimerReset.addEventListener('click', () => {
    clearInterval(state.timer.interval);
    state.timer = { remaining: 0, total: 0, running: false, paused: false, interval: null };

    timerSetup.style.display = 'grid';
    timerActive.style.display = 'none';
    btnTimerStart.textContent = 'INICIAR FOCO';

    document.getElementById('t-hour').value = 0;
    document.getElementById('t-min').value = 25;
    document.getElementById('t-sec').value = 0;
    timerDisplay.textContent = '25:00';
    timerBar.style.width = '100%';
});


// ======================== CRONÔMETRO ========================
const swDisplay = document.getElementById('swDisplay');
const btnSwStart = document.getElementById('btn-sw-start');
const btnSwLap = document.getElementById('btn-sw-lap');
const btnSwReset = document.getElementById('btn-sw-reset');
const lapsList = document.getElementById('lapsList');

btnSwStart.addEventListener('click', () => {
    if (!state.stopwatch.running) {
        state.stopwatch.startTime = Date.now() - state.stopwatch.elapsed;
        state.stopwatch.interval = setInterval(() => {
            state.stopwatch.elapsed = Date.now() - state.stopwatch.startTime;
            updateStopwatchDisplay();
        }, 10);
        state.stopwatch.running = true;
        btnSwStart.textContent = 'PAUSAR';
        btnSwLap.disabled = false;
    } else {
        clearInterval(state.stopwatch.interval);
        state.stopwatch.running = false;
        btnSwStart.textContent = 'CONTINUAR';
    }
});

function updateStopwatchDisplay() {
    const t = state.stopwatch.elapsed;
    const m = Math.floor(t / 60000).toString().padStart(2, '0');
    const s = Math.floor((t % 60000) / 1000).toString().padStart(2, '0');
    const ms = Math.floor((t % 1000) / 10).toString().padStart(2, '0');
    swDisplay.innerHTML = `${m}:${s}<span class="ms">.${ms}</span>`;
}

btnSwLap.addEventListener('click', () => {
    if (!state.stopwatch.running) return;

    const total = state.stopwatch.elapsed;
    const lapTime = total - state.stopwatch.lastLap;
    state.stopwatch.lastLap = total;

    const formatTime = (ms) => {
        const m = Math.floor(ms / 60000).toString().padStart(2, '0');
        const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
        const cs = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
        return `${m}:${s}.${cs}`;
    };

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>#${lapsList.children.length + 1}</td>
        <td>${formatTime(lapTime)}</td>
        <td>${formatTime(total)}</td>
    `;
    lapsList.prepend(row);
});

btnSwReset.addEventListener('click', () => {
    clearInterval(state.stopwatch.interval);
    state.stopwatch = { startTime: 0, elapsed: 0, running: false, interval: null, lastLap: 0 };
    swDisplay.innerHTML = '00:00<span class="ms">.00</span>';
    btnSwStart.textContent = 'INICIAR';
    btnSwLap.disabled = true;
    lapsList.innerHTML = '';
});


// ======================== ALARME ========================
const alarmInput = document.getElementById('alarmInput');
const alarmList = document.getElementById('alarmList');

document.getElementById('btn-add-alarm').addEventListener('click', addAlarm);
alarmInput.addEventListener('keydown', e => e.key === 'Enter' && addAlarm());

function addAlarm() {
    const time = alarmInput.value.trim();
    if (!time) return;

    const alarm = {
        id: Date.now(),
        time,
        active: true
    };

    state.alarms.push(alarm);
    localStorage.setItem('loopr_alarms', JSON.stringify(state.alarms));
    alarmInput.value = '';
    renderAlarms();
}

function removeAlarm(id) {
    state.alarms = state.alarms.filter(a => a.id !== id);
    localStorage.setItem('loopr_alarms', JSON.stringify(state.alarms));
    renderAlarms();
}

function toggleAlarm(id) {
    state.alarms = state.alarms.map(a => 
        a.id === id ? { ...a, active: !a.active } : a
    );
    localStorage.setItem('loopr_alarms', JSON.stringify(state.alarms));
    renderAlarms();
}

function renderAlarms() {
    if (state.alarms.length === 0) {
        alarmList.innerHTML = '<p style="color: var(--text-muted); opacity: 0.8;">Nenhum alarme configurado</p>';
        return;
    }

    alarmList.innerHTML = state.alarms
        .sort((a, b) => a.time.localeCompare(b.time))
        .map(alarm => `
            <div class="alarm-item">
                <span class="alarm-time">${alarm.time}</span>
                <div class="alarm-actions">
                    <button onclick="toggleAlarm(${alarm.id})" class="alarm-toggle" aria-label="${alarm.active ? 'Desativar' : 'Ativar'} alarme">
                        <i class="fas fa-bell${alarm.active ? '' : '-slash'}"></i>
                    </button>
                    <button onclick="removeAlarm(${alarm.id})" class="alarm-delete" aria-label="Remover alarme">×</button>
                </div>
            </div>
        `).join('');
}

function checkAlarms(now) {
    const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    state.alarms.forEach(alarm => {
        if (alarm.active && alarm.time === currentTime && now.getSeconds() < 5) {
            notificationSound.play();
            alert(`⏰ Alarme disparado: ${alarm.time}`);
            alarm.active = false; // Desativa após tocar
            renderAlarms();
        }
    });
}

renderAlarms();
