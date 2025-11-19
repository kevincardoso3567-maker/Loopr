// foco.js - Funcional e bonito
const modes = {
  clock: document.getElementById('clock-mode'),
  stopwatch: document.getElementById('stopwatch-mode'),
  timer: document.getElementById('timer-mode'),
  alarm: document.getElementById('alarm-mode')
};

let timerInterval, stopwatchInterval, alarmTimeout;
let stopwatchRunning = false;
let totalTimerSeconds = 0;
let remainingSeconds = 0;

// Trocar abas
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.mode').forEach(m => m.classList.remove('active'));
    btn.classList.add('active');
    modes[btn.dataset.mode].classList.add('active');
  });
});

// RELÓGIO
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.querySelector('#clock-mode .clock-display').textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

// CRONÔMETRO
let stopwatchTime = 0;
document.getElementById('startStopwatch').onclick = () => {
  if (!stopwatchRunning) {
    stopwatchInterval = setInterval(() => {
      stopwatchTime++;
      displayStopwatch(stopwatchTime);
    }, 1000);
    stopwatchRunning = true;
  }
};
document.getElementById('pauseStopwatch').onclick = () => {
  clearInterval(stopwatchInterval);
  stopwatchRunning = false;
};
document.getElementById('resetStopwatch').onclick = () => {
  clearInterval(stopwatchInterval);
  stopwatchRunning = false;
  stopwatchTime = 0;
  displayStopwatch(0);
};
function displayStopwatch(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  document.querySelector('#stopwatch-mode .clock-display').textContent = `${h}:${m}:${s}`;
}

// TIMER POMODORO
document.getElementById('startTimer').onclick = () => {
  if (timerInterval) clearInterval(timerInterval);
  const min = parseInt(document.getElementById('timerMinutes').value) || 0;
  const sec = parseInt(document.getElementById('timerSeconds').value) || 0;
  totalTimerSeconds = remainingSeconds = min * 60 + sec;
  if (remainingSeconds <= 0) return;
  updateTimerDisplay(remainingSeconds);
  document.querySelector('.progress-bar-fill').style.width = '100%';
  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerDisplay(remainingSeconds);
    const percent = (remainingSeconds / totalTimerSeconds) * 100;
    document.querySelector('.progress-bar-fill').style.width = percent + '%';
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      playAlarm();
    }
  }, 1000);
};
function updateTimerDisplay(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  document.querySelector('#timer-mode .clock-display').textContent = `${m}:${s}`;
}

// ALARME
document.getElementById('setAlarm').onclick = () => {
  const time = document.getElementById('alarmTime').value;
  if (!time) return;
  const [h, m] = time.split(':');
  const now = new Date();
  const alarm = new Date();
  alarm.setHours(h, m, 0, 0);
  if (alarm <= now) alarm.setDate(alarm.getDate() + 1);
  const diff = alarm - now;
  document.querySelector('.alarm-status').textContent = `Alarme para ${time}`;
  document.querySelector('.alarm-status').classList.add('active');
  if (alarmTimeout) clearTimeout(alarmTimeout);
  alarmTimeout = setTimeout(() => {
    playAlarm();
    document.querySelector('.alarm-status').textContent = 'ALARME TOCANDO!';
  }, diff);
};

function playAlarm() {
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-tone-1057.mp3');
  audio.play();
  alert("TEMPO ACABOU! Bora estudar!");
}

// Iniciar no relógio
updateClock();