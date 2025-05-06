let questions = [], currentQuestionIndex = 0, score = 0, selectedOptionIndex = null;
let playerName = "", totalQuestions = 3;
let timerInterval;
let timeLeft = 15;
const totalTime = 15;

const welcomeScreen = document.getElementById('welcomeScreen');
const quizContainer = document.getElementById('quizContainer');
const startButton = document.getElementById('startGame');
const userNameInput = document.getElementById('userName');
const questionCountSlider = document.getElementById('questionCount');
const questionCountValue = document.getElementById('questionCountValue');
const playerNameDisplay = document.getElementById('playerName');
const counterElement = document.getElementById('counter');
const quizContent = document.getElementById('quizContent');
const resultElement = document.getElementById('result');

// Inizializza lo slider
questionCountSlider.addEventListener('input', function() {
    questionCountValue.textContent = this.value;
});

document.addEventListener('DOMContentLoaded', () => {
    startButton.addEventListener('click', startGame);
    document.getElementById('restart').addEventListener('click', restartGame);
    userNameInput.addEventListener('keypress', e => { if (e.key === 'Enter') startGame(); });
});

async function startGame() {
    resultElement.classList.add('hidden');
    quizContent.classList.remove('hidden');

    playerName = userNameInput.value.trim() || 'Ospite';
    totalQuestions = parseInt(questionCountSlider.value);
    startButton.disabled = true;
    try {
        const res = await fetch('questions.json');
        const data = await res.json();
        if (!Array.isArray(data) || !data.length) throw new Error('Nessuna domanda valida');
        questions = shuffleArray(data).slice(0, totalQuestions);
        toggleScreen(welcomeScreen, quizContainer);
        playerNameDisplay.textContent = `Giocatore: ${playerName}`;
        currentQuestionIndex = 0; 
        score = 0; 
        showQuestion();
    } catch(err) {
        alert('Errore nel caricamento delle domande.');
        console.error(err);
    } finally { startButton.disabled = false; }
}

function toggleScreen(hide, show) {
    hide.classList.replace('visible','hidden');
    show.classList.replace('hidden','visible');
    
    if (show.id === 'quizContainer') {
        const headerBar = document.querySelector('.header-bar');
        headerBar.innerHTML = `
            <div id="playerName" class="player-name">Giocatore: ${playerName}</div>
            <div class="timer-container">
                <span class="timer-label">Tempo:</span>
                <div class="timer-bar">
                    <div id="timerProgress" class="timer-progress"></div>
                </div>
                <span id="timerSeconds" class="timer-seconds">15</span>
            </div>
            <div class="counter" id="counter">1/${totalQuestions}</div>
        `;
    }
}

function shuffleArray(arr) {
    return arr.sort(() => Math.random() - .5);
}

function showQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById('question').textContent = q.question;
    const opts = document.getElementById('options'); 
    opts.innerHTML = '';
    const nextBtn = document.getElementById('next'); 
    nextBtn.classList.add('hidden');
    selectedOptionIndex = null; 
    updateCounter();
    
    // Reset timer
    timeLeft = totalTime;
    updateTimerDisplay();
    startTimer();

    q.options.forEach((opt, i) => {
        const card = document.createElement('div');
        card.className = 'option-card animate__animated animate__fadeIn';
        card.innerHTML = `<div class="option-content">${opt}</div>`;
        card.addEventListener('click', () => {
            clearInterval(timerInterval);
            selectOption(card, i);
        });
        opts.appendChild(card);
    });
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerProgress = document.getElementById('timerProgress');
    const timerSeconds = document.getElementById('timerSeconds');
    if (timerProgress && timerSeconds) {
        const percentage = (timeLeft / totalTime) * 100;
        timerProgress.style.width = `${percentage}%`;
        timerSeconds.textContent = timeLeft;
        
        // Cambia colore in base al tempo rimanente
        timerProgress.classList.remove('timer-warning', 'timer-danger');
        if (timeLeft <= 5) {
            timerProgress.classList.add('timer-danger');
        } else if (timeLeft <= 10) {
            timerProgress.classList.add('timer-warning');
        }
    }
}

function timeUp() {
    if (selectedOptionIndex === null) {
        const q = questions[currentQuestionIndex];
        const cards = document.querySelectorAll('.option-card');
        cards.forEach((card, i) => {
            if (i === q.answer) {
                card.classList.add('correct');
            }
        });
        document.getElementById('next').disabled = true;
        setTimeout(() => {
            document.getElementById('next').disabled = false;
            currentQuestionIndex++;
            if (currentQuestionIndex < totalQuestions) {
                showQuestion();
            } else {
                showResults();
            }
        }, 1500);
    }
}

function selectOption(card, idx) {
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected','correct','wrong'));
    card.classList.add('selected'); 
    selectedOptionIndex = idx;
    document.getElementById('next').classList.remove('hidden');
}

document.getElementById('next').addEventListener('click', () => {
    if (selectedOptionIndex === null) { alert('Seleziona una risposta.'); return; }
    const correct = questions[currentQuestionIndex].answer;
    const cards = document.querySelectorAll('.option-card');
    if (selectedOptionIndex === correct) { 
        cards[correct].classList.add('correct'); 
        score++; 
    } else { 
        cards[selectedOptionIndex].classList.add('wrong'); 
        cards[correct].classList.add('correct'); 
    }
    document.getElementById('next').disabled = true;
    setTimeout(() => {
        document.getElementById('next').disabled = false;
        currentQuestionIndex++;
        if (currentQuestionIndex < totalQuestions) {
            showQuestion();
        } else {
            showResults();
        }
    }, 1500);
});

function updateCounter() {
    if (counterElement) {
        counterElement.textContent = `${currentQuestionIndex + 1}/${totalQuestions}`;
    }
}

function showResults() {
    clearInterval(timerInterval);
    quizContent.classList.add('hidden');
    resultElement.classList.remove('hidden');

    const high = +localStorage.getItem('quizHighScore') || 0;
    const acc = Math.round((score/totalQuestions)*100);
    
    const emoji = acc >= 50 ? '🎉' : '😢';
    document.getElementById('score').innerHTML = `
        <div class="final-score">${score}<span class="score-divider">/</span>${totalQuestions}</div>
        <div class="accuracy">${acc}% di risposte corrette</div>
        <div class="emoji-result">${emoji}</div>
    `;

    if (score > high) {
        localStorage.setItem('quizHighScore', score);
        showConfetti();
        document.getElementById('newRecord').classList.remove('hidden');
    }
}

function showConfetti() {
    for (let i=0;i<50;i++) {
        const c = document.createElement('div'); 
        c.className='confetti';
        c.style.left = Math.random()*100+'vw';
        c.style.animation = `confetti-fall ${Math.random()*3+2}s linear`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 5000);
    }
}

function restartGame() {
    clearInterval(timerInterval);
    resultElement.classList.add('hidden');
    toggleScreen(quizContainer, welcomeScreen);
    quizContent.classList.remove('hidden');
}