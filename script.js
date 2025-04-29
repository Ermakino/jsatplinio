let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let emojis = [];
let selectedOptionIndex = null;

const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextButton = document.getElementById('next');
const resultElement = document.getElementById('result');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart');
const counterElement = document.getElementById('counter');
const quizContainer = document.getElementById('quizContainer');

// Carica le domande da questions.json
fetch('questions.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Errore HTTP: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (!Array.isArray(data)) {
            throw new Error('Il file JSON non contiene un array.');
        }
        data.forEach((q, i) => {
            if (
                typeof q.question !== 'string' ||
                !Array.isArray(q.options) ||
                typeof q.answer !== 'number' ||
                q.answer < 0 || q.answer >= q.options.length
            ) {
                throw new Error(`Errore nella domanda ${i + 1}: formato non valido.`);
            }
        });

        questions = data;
        startQuiz(); // Avvia il quiz solo dopo che le domande sono caricate
    })
    .catch(error => {
        console.error('Errore nel caricamento delle domande:', error);
        questionElement.textContent = 'Errore: ' + error.message;
    });

// Fade-in quando la pagina carica
window.addEventListener('DOMContentLoaded', () => {
    quizContainer.classList.add('fade-in');
    setTimeout(() => {
        quizContainer.classList.add('visible');
    }, 100);  // Ritardo di 100ms per iniziare la transizione
});

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    emojis = [];
    selectedOptionIndex = null;

    resultElement.classList.add('hidden');
    questionElement.classList.remove('hidden');
    optionsElement.classList.remove('hidden');
    //nextButton.classList.add('hidden');

    showQuestion();
}

function showQuestion() {
    const question = questions[currentQuestionIndex];
    questionElement.textContent = question.question;
    optionsElement.innerHTML = '';
    selectedOptionIndex = null;
    //nextButton.classList.add('hidden');
    updateCounter();

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('option');
        optionDiv.innerHTML = `<div class="dot"></div>${option}`;
        optionsElement.appendChild(optionDiv);

        optionDiv.addEventListener('click', () => {
            // Deseleziona tutte
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('.dot').style.backgroundColor = '#007bff';
            });

            // Seleziona quella cliccata
            optionDiv.classList.add('selected');
            optionDiv.querySelector('.dot').style.backgroundColor = '#00ccff';
            selectedOptionIndex = index;
            nextButton.classList.remove('hidden');
        });
    });
}

function updateCounter() {
    counterElement.textContent = `Domande: ${currentQuestionIndex + 1} / ${questions.length}`;
}

nextButton.addEventListener('click', () => {
    if (selectedOptionIndex === null) return;

    const correctAnswer = questions[currentQuestionIndex].answer;

    if (selectedOptionIndex === correctAnswer) {
        score++;
        emojis[currentQuestionIndex] = '✅';
    } else {
        emojis[currentQuestionIndex] = '❌';
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
});

function showResult() {
    // Nascondi il pulsante "Prossima Domanda"
    nextButton.classList.add('hidden');
    
    // Nascondi domanda e opzioni
    questionElement.classList.add('hidden');
    optionsElement.classList.add('hidden');
    
    // Mostra la sezione dei risultati
    resultElement.classList.remove('hidden');
    
    // Visualizza il punteggio e le emoji
    scoreElement.innerHTML = `${score} risposte giuste su ${questions.length} <br><br> ${emojis.join(' ')}`;
}

restartButton.addEventListener('click', startQuiz);
