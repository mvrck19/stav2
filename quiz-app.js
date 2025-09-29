// quiz-app.js
// All JavaScript logic separated from index.html

let currentQuestionIndex = 0;
let questions = [];
let categories = [];
let currentCategory = null;
let answeredMap = {}; // key: question id => { chosenIndex, correct }
let score = 0; // points: 10 per correct
let targetScore = 0; // used for animation
let scoreAnimating = false;
let totalAnswered = 0;
let shuffledChoicesCache = {}; // question id -> array of {text, originalIndex}
let inReview = false;
let highScores = {}; // category id -> highest score

// Load high scores from localStorage
function loadHighScores() {
    try {
        const stored = localStorage.getItem('quizHighScores');
        if (stored) {
            highScores = JSON.parse(stored);
        }
    } catch (e) {
        highScores = {};
    }
}

// Save high scores to localStorage
function saveHighScores() {
    try {
        localStorage.setItem('quizHighScores', JSON.stringify(highScores));
    } catch (e) {
        // localStorage not available
    }
}

// Update high score for category
function updateHighScore(categoryId, newScore) {
    const currentHigh = highScores[categoryId] || 0;
    if (newScore > currentHigh) {
        highScores[categoryId] = newScore;
        saveHighScores();
        return true; // new record
    }
    return false;
}

// Fetch categories and render category screen
async function loadCategories() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        categories = data.categories || [];
        loadHighScores();
        renderCategories();
    } catch (e) {
        console.error(e);
        alert('Σφάλμα φόρτωσης κατηγοριών');
    }
}

function renderCategories() {
    const wrap = document.getElementById('categories');
    wrap.innerHTML = '';
    if (!categories.length) {
        wrap.innerHTML = '<p>Δεν υπάρχουν κατηγορίες.</p>';
        return;
    }
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        const highScore = highScores[cat.id] || 0;
        const highScoreText = highScore > 0 ? `<span class="high-score">Καλύτερο: ${highScore} πόντοι</span>` : '';
        btn.innerHTML = `<span class="category-title">${cat.title}</span><span class="category-desc">${cat.description || ''}</span>${highScoreText}`;
        btn.addEventListener('click', () => startCategory(cat.id));
        wrap.appendChild(btn);
    });
}

function startCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    currentCategory = cat;
    questions = [...cat.questions];
    currentQuestionIndex = 0;
    answeredMap = {};
    score = 0;
    targetScore = 0;
    totalAnswered = 0;
    shuffledChoicesCache = {};
    inReview = false;
    // show score only in game
    const globalScore = document.getElementById('globalScore');
    if (globalScore) {
        globalScore.style.display = 'flex';
        globalScore.textContent = 'Points: 0';
    }
    const backBtn = document.getElementById('backToCategories');
    if (backBtn) backBtn.style.display = 'flex';
    document.getElementById('category-screen').style.display = 'none';
    document.getElementById('cards-container').style.display = 'block';
    document.getElementById('action-buttons').style.display = 'flex';
    
    // Set background SVGs for the new structure
    const questionCard = document.getElementById('question-card');
    const answerCard = document.getElementById('answer-card');
    
    if (questionCard && answerCard) {
        // Remove old category classes
        questionCard.className = questionCard.className.replace(/\b(syntax|grammar)\b/g, '');
        answerCard.className = answerCard.className.replace(/\b(syntax|grammar)\b/g, '');
        
        // Add new category classes for background images
        questionCard.classList.add(cat.id);
        answerCard.classList.add(cat.id);
        
        // Initialize the quiz
        setTimeout(() => {
            displayQuestion(0);
            document.querySelector('.question-section').classList.add('active');
            updateProgress();
            updateScore(true);
            updatePrevButton();
        }, 100);
    }
}

function updateProgress() {
    const progressEl = document.getElementById('progressBarText');
    if (progressEl) {
        progressEl.textContent = `${currentQuestionIndex + 1} / ${questions.length}`;
    }
}

// Display current question
function displayQuestion(index) {
    if (index >= questions.length) {
        return;
    }
    const q = questions[index];
    updateQuestion(q);
    const answered = answeredMap[q.id];
    if (answered) {
        document.getElementById('card3d').classList.add('flipped');
        document.querySelector('.question-section').classList.remove('active');
        document.querySelector('.answer-section').classList.add('active');
        updateAnswer(q, answered.chosenIndex);

        // Change submit button to next button for answered questions
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.textContent = 'Επόμενη';
            submitBtn.disabled = false;
            submitBtn.onclick = () => {
                currentQuestionIndex++;
                if (currentQuestionIndex >= questions.length) {
                    showSessionSummary(true);
                } else {
                    displayQuestion(currentQuestionIndex);
                }
            };
        }
    } else {
        const card3d = document.getElementById('card3d');
        card3d.classList.remove('flipped');
        document.querySelector('.question-section').classList.add('active');
        document.querySelector('.answer-section').classList.remove('active');
        setTimeout(() => {
            // Reset submit button for unanswered questions
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.style.display = 'none';
                submitBtn.disabled = true;
                submitBtn.textContent = 'Υποβολή';
            }
        }, 100);
    }
    updateProgress();
    updatePrevButton();
}

// Update question and choices in SVG
// Update question content in HTML overlay (new approach)
function updateQuestion(q) {
    const questionText = document.getElementById('question-text');
    const choicesContainer = document.getElementById('choices-container');
    
    if (questionText) {
        questionText.textContent = q.question;
    }
    
    if (choicesContainer) {
        choicesContainer.innerHTML = '';
        
        // Create or get shuffled choices
        let choicesWithOriginal;
        if (shuffledChoicesCache[q.id]) {
            choicesWithOriginal = shuffledChoicesCache[q.id];
        } else {
            choicesWithOriginal = q.choices.map((text, originalIndex) => ({ text, originalIndex }));
            shuffleArray(choicesWithOriginal);
            shuffledChoicesCache[q.id] = choicesWithOriginal;
        }
        
        // Create choice buttons
        choicesWithOriginal.forEach((obj, renderedIndex) => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = obj.text;
            button.dataset.originalIndex = obj.originalIndex;
            button.dataset.renderedIndex = renderedIndex;
            button.onclick = () => selectChoice(renderedIndex);
            choicesContainer.appendChild(button);
        });
        
        // Set up external submit button
        const externalSubmitBtn = document.getElementById('submit-btn');
        if (externalSubmitBtn) {
            externalSubmitBtn.textContent = 'Υποβολή';
            externalSubmitBtn.style.display = 'none';
            externalSubmitBtn.disabled = true;
            externalSubmitBtn.onclick = () => {
                const selectedBtn = choicesContainer.querySelector('.choice-button.selected');
                if (selectedBtn) {
                    const renderedIndex = parseInt(selectedBtn.dataset.renderedIndex);
                    evaluateAnswer(renderedIndex);
                }
            };
        }
    }
}

// Update answer content in HTML overlay (new approach)
function updateAnswer(q, chosenOriginalIndex) {
    const resultStatus = document.getElementById('result-status');
    const userChoice = document.getElementById('user-choice');
    const correctAnswer = document.getElementById('correct-answer');
    const explanation = document.getElementById('explanation');
    
    const correct = q.correctIndex === chosenOriginalIndex;
    
    if (resultStatus) {
        resultStatus.textContent = correct ? 'Σωστό! 🎉' : 'Λάθος 😞';
        resultStatus.className = `result-status ${correct ? 'correct' : 'wrong'}`;
    }
    
    if (userChoice) {
        userChoice.textContent = q.choices[chosenOriginalIndex];
    }

    if (correctAnswer && !correct) {
        correctAnswer.textContent = q.choices[q.correctIndex];
        correctAnswer.classList.remove('hidden');
    } else if (correctAnswer) {
        correctAnswer.classList.add('hidden');
    }
    
    if (explanation && q.explanation) {
        explanation.textContent = q.explanation;
        explanation.classList.remove('hidden');
    } else if (explanation) {
        explanation.classList.add('hidden');
    }
    
    // Change submit button to next button after answering
    const externalSubmitBtn = document.getElementById('submit-btn');
    if (externalSubmitBtn) {
        externalSubmitBtn.textContent = 'Επόμενη';
        externalSubmitBtn.style.display = 'inline-block';
        externalSubmitBtn.disabled = false;
        externalSubmitBtn.onclick = () => {
            currentQuestionIndex++;
            if (currentQuestionIndex >= questions.length) {
                showSessionSummary(true);
            } else {
                displayQuestion(currentQuestionIndex);
            }
        };
    }
}

function selectChoice(renderedIndex) {
    const q = questions[currentQuestionIndex];
    if (!q) return;
    
    // Update choice buttons in the HTML overlay
    const questionContent = document.querySelector('.question-content');
    if (questionContent) {
        const allBtns = questionContent.querySelectorAll('.choice-button');
        allBtns.forEach(btn => btn.classList.remove('selected'));
        const selectedBtn = allBtns[renderedIndex];
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        // Show external submit button
        const externalSubmitBtn = document.getElementById('submit-btn');
        if (externalSubmitBtn) {
            externalSubmitBtn.style.display = 'inline-block';
            externalSubmitBtn.disabled = false;
        }
    }
}

function evaluateAnswer(renderedIndex) {
    const q = questions[currentQuestionIndex];
    const mapped = shuffledChoicesCache[q.id];
    const chosenObj = mapped[renderedIndex];
    const chosenOriginalIndex = chosenObj.originalIndex;
    const correct = chosenOriginalIndex === q.correctIndex;
    answeredMap[q.id] = { chosenIndex: chosenOriginalIndex, correct };
    totalAnswered = Object.keys(answeredMap).length;
    if (correct) score += 10;
    persistState();
    const card3d = document.getElementById('card3d');
    card3d.classList.add('flipped');
    document.querySelector('.question-section').classList.remove('active');
    document.querySelector('.answer-section').classList.add('active');
    updateAnswer(q, chosenOriginalIndex);
    updateScore(false, correct);
}

function renderAnswerReview(q, chosenOriginalIndex, container) {
    const correct = q.correctIndex === chosenOriginalIndex;
    container.innerHTML = '';
    const userDiv = document.createElement('div');
    userDiv.className = 'user-choice';
    userDiv.textContent = q.choices[chosenOriginalIndex];
    const explain = document.createElement('div');
    explain.style.marginTop = '6px';
    explain.textContent = q.explanation || '';
    container.appendChild(userDiv);
    container.appendChild(explain);
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function updateScore(immediate=false, animate=false) {
    const scoreEl = document.getElementById('globalScore');
    if (!scoreEl) return;
    if (immediate || !animate) {
        scoreEl.textContent = `Points: ${score}`;
        return;
    }
    if (scoreAnimating) return;
    scoreAnimating = true;
    const start = performance.now();
    const initial = parseInt(scoreEl.textContent.replace(/\D/g,'')||'0',10);
    const from = initial;
    const to = score;
    const duration = 450;
    scoreEl.classList.add('score-anim');
    function step(ts){
        const t = Math.min(1, (ts-start)/duration);
        const eased = t<0.5 ? 2*t*t : -1+(4-2*t)*t;
        const current = Math.round(from + (to-from)*eased);
        scoreEl.textContent = `Points: ${current}`;
        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            scoreAnimating = false;
            setTimeout(()=>scoreEl.classList.remove('score-anim'),120);
        }
    }
    requestAnimationFrame(step);
}

function updatePrevButton() {
    // prevButton element no longer exists - functionality moved to SVG
}

const backBtnEl = document.getElementById('backToCategories');
if (backBtnEl) {
    backBtnEl.addEventListener('click', () => {
        showSessionSummary(false);
    });
}

const summaryReturnBtn = document.getElementById('summaryReturnBtn');
if (summaryReturnBtn) {
    summaryReturnBtn.addEventListener('click', hideSummaryAndReturn);
}

function showSessionSummary(isCompletion = false) {
    const correctAnswers = Object.values(answeredMap).filter(a => a.correct).length;
    const totalQuestions = questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const isNewRecord = updateHighScore(currentCategory.id, score);
    document.getElementById('summaryPoints').textContent = score;
    document.getElementById('summaryAccuracy').textContent = `${accuracy}%`;
    document.getElementById('summaryCorrect').textContent = `${correctAnswers}/${totalQuestions}`;
    const highScoreNotice = document.getElementById('highScoreNotice');
    if (isNewRecord) {
        highScoreNotice.style.display = 'block';
    } else {
        highScoreNotice.style.display = 'none';
    }
    document.getElementById('summaryModal').style.display = 'flex';
}

function hideSummaryAndReturn() {
    document.getElementById('summaryModal').style.display = 'none';
    document.getElementById('cards-container').style.display = 'none';
    document.getElementById('action-buttons').style.display = 'none';
    document.getElementById('category-screen').style.display = 'block';
    const globalScore = document.getElementById('globalScore');
    if (globalScore) globalScore.style.display = 'none';
    const backBtn = document.getElementById('backToCategories');
    if (backBtn) backBtn.style.display = 'none';
    const card3d = document.getElementById('card3d');
    if (card3d) {
        card3d.classList.remove('flipped');
    }
    document.querySelector('.question-section')?.classList.add('active');
    document.querySelector('.answer-section')?.classList.remove('active');
    answeredMap = {};
    score = 0;
    targetScore = 0;
    totalAnswered = 0;
    shuffledChoicesCache = {};
    currentCategory = null;
    currentQuestionIndex = 0;
    const qSvg = document.getElementById('qSvg');
    const aSvg = document.getElementById('aSvg');
    if (qSvg) {
        const newQSvg = qSvg.cloneNode(true);
        qSvg.parentNode.replaceChild(newQSvg, qSvg);
        newQSvg.id = 'qSvg';
        newQSvg.setAttribute('data', '');
    }
    if (aSvg) {
        const newASvg = aSvg.cloneNode(true);
        aSvg.parentNode.replaceChild(newASvg, aSvg);
        newASvg.id = 'aSvg';
        newASvg.setAttribute('data', '');
    }
    renderCategories();
}

function persistState() { /* no-op */ }

document.addEventListener('DOMContentLoaded', loadCategories);

function hideSvgTitles() {
    const qObj = document.getElementById('qSvg');
    const aObj = document.getElementById('aSvg');
    function tryHide(obj) {
        try {
            const svg = obj.contentDocument || obj.getSVGDocument && obj.getSVGDocument();
            if (svg) {
                const texts = svg.querySelectorAll('text');
                texts.forEach(t => {
                    const txt = (t.textContent || '').trim();
                    if (txt.includes('ΕΡΩΤΗΣΗ') || txt.includes('ΑΠΑΝΤΗΣΗ')) {
                        t.style.display = 'none';
                    }
                });
            }
        } catch (e) {}
    }
    if (qObj) {
        qObj.addEventListener('load', () => tryHide(qObj));
        tryHide(qObj);
    }
    if (aObj) {
        aObj.addEventListener('load', () => tryHide(aObj));
        tryHide(aObj);
    }
}
setTimeout(hideSvgTitles, 250);
