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
    // swap SVG assets depending on category
    const qSvg = document.getElementById('qSvg');
    const aSvg = document.getElementById('aSvg');
    if (qSvg && aSvg) {
        let svgsLoaded = 0;
        const totalSvgs = 2;
        function onSvgLoad() {
            svgsLoaded++;
            if (svgsLoaded === totalSvgs) {
                setTimeout(() => {
                    displayQuestion(0);
                    document.querySelector('.question-section').classList.add('active');
                    updateProgress();
                    updateScore(true);
                    updatePrevButton();
                }, 200);
            }
        }
        function checkSvgLoaded(svgElement) {
            if (svgElement.contentDocument) {
                onSvgLoad();
            }
        }
        qSvg.setAttribute('data', '');
        aSvg.setAttribute('data', '');
        svgsLoaded = 0;
        qSvg.removeEventListener('load', onSvgLoad);
        aSvg.removeEventListener('load', onSvgLoad);
        qSvg.addEventListener('load', onSvgLoad, { once: true });
        aSvg.addEventListener('load', onSvgLoad, { once: true });
        setTimeout(() => {
            if (cat.id === 'grammar') {
                qSvg.setAttribute('data', 'svg/grammar_q.svg');
                aSvg.setAttribute('data', 'svg/grammar_a.svg');
            } else if (cat.id === 'syntax') {
                qSvg.setAttribute('data', 'svg/syntax_q.svg');
                aSvg.setAttribute('data', 'svg/syntax_a.svg');
            }
            setTimeout(() => {
                checkSvgLoaded(qSvg);
                checkSvgLoaded(aSvg);
            }, 300);
        }, 50);
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
    updateQuestionInSVG(q);
    const answered = answeredMap[q.id];
    if (answered) {
        document.getElementById('card3d').classList.add('flipped');
        document.querySelector('.question-section').classList.remove('active');
        document.querySelector('.answer-section').classList.add('active');
        updateAnswerInSVG(q, answered.chosenIndex);
        
        // Show next button, hide submit button for answered questions
        const submitBtn = document.getElementById('submit-btn');
        const nextBtn = document.getElementById('next-btn');
        if (submitBtn) {
            submitBtn.style.display = 'none';
            submitBtn.disabled = true;
        }
        if (nextBtn) {
            nextBtn.style.display = 'inline-block';
            nextBtn.disabled = false;
        }
    } else {
        const card3d = document.getElementById('card3d');
        card3d.classList.remove('flipped');
        document.querySelector('.question-section').classList.add('active');
        document.querySelector('.answer-section').classList.remove('active');
        setTimeout(() => {
            // Reset external buttons for unanswered questions
            const submitBtn = document.getElementById('submit-btn');
            const nextBtn = document.getElementById('next-btn');
            if (submitBtn) {
                submitBtn.style.display = 'none';
                submitBtn.disabled = true;
            }
            if (nextBtn) {
                nextBtn.style.display = 'none';
                nextBtn.disabled = true;
            }
        }, 100);
    }
    updateProgress();
    updatePrevButton();
}

// Update question and choices in SVG
function updateQuestionInSVG(q) {
    const qSvgObj = document.getElementById('qSvg');
    function tryUpdateSVG() {
        try {
            const svgDoc = qSvgObj.contentDocument;
            if (!svgDoc) return false;
            const foreignObject = svgDoc.querySelector('foreignObject');
            if (!foreignObject) return false;
            const htmlBody = foreignObject.querySelector('body');
            if (!htmlBody) return false;
            let qTextDiv = htmlBody.querySelector('#question-text');
            if (!qTextDiv) qTextDiv = htmlBody.querySelector('.text-area');
            let choicesArea = htmlBody.querySelector('#choices-area');
            if (!choicesArea) choicesArea = htmlBody.querySelector('.choices-area');
            if (qTextDiv) qTextDiv.textContent = q.question;
            if (choicesArea) {
                choicesArea.innerHTML = '';
                let choicesWithOriginal;
                if (shuffledChoicesCache[q.id]) {
                    choicesWithOriginal = shuffledChoicesCache[q.id];
                } else {
                    choicesWithOriginal = q.choices.map((text, originalIndex) => ({ text, originalIndex }));
                    shuffleArray(choicesWithOriginal);
                    shuffledChoicesCache[q.id] = choicesWithOriginal;
                }
                choicesWithOriginal.forEach((obj, renderedIndex) => {
                    const btnHtml = `<div class="choice-btn" data-original-index="${obj.originalIndex}">${obj.text}</div>`;
                    choicesArea.insertAdjacentHTML('beforeend', btnHtml);
                });
                const createdBtns = choicesArea.querySelectorAll('.choice-btn');
                createdBtns.forEach((btn, renderedIndex) => {
                    btn.onclick = () => selectChoiceInSVG(renderedIndex);
                });
                
                // Set up external submit button
                const externalSubmitBtn = document.getElementById('submit-btn');
                if (externalSubmitBtn) {
                    externalSubmitBtn.style.display = 'none';
                    externalSubmitBtn.disabled = true;
                    externalSubmitBtn.onclick = () => {
                        const selectedBtn = htmlBody.querySelector('.choice-btn.selected');
                        if (selectedBtn) {
                            const renderedIndex = Array.from(createdBtns).indexOf(selectedBtn);
                            evaluateAnswer(renderedIndex);
                        }
                    };
                }
            }
            return true;
        } catch (e) {
            return false;
        }
    }
    if (qSvgObj) {
        if (tryUpdateSVG()) return;
        let retryCount = 0;
        const maxRetries = 5;
        function retryUpdate() {
            retryCount++;
            if (tryUpdateSVG()) return;
            if (retryCount < maxRetries) {
                setTimeout(retryUpdate, 200 * retryCount);
            }
        }
        qSvgObj.addEventListener('load', () => {
            setTimeout(retryUpdate, 300);
        }, { once: true });
        setTimeout(retryUpdate, 500);
    }
}

// Update answer in SVG
function updateAnswerInSVG(q, chosenOriginalIndex) {
    const aSvgObj = document.getElementById('aSvg');
    function tryUpdateAnswerSVG() {
        try {
            const svgDoc = aSvgObj.contentDocument;
            if (!svgDoc) return false;
            const foreignObject = svgDoc.querySelector('foreignObject');
            if (!foreignObject) return false;
            const htmlBody = foreignObject.querySelector('body');
            if (!htmlBody) return false;
            const resultStatus = htmlBody.querySelector('#result-status');
            const userChoice = htmlBody.querySelector('#user-choice');
            const correctAnswer = htmlBody.querySelector('#correct-answer');
            const explanation = htmlBody.querySelector('#explanation');
            const correct = q.correctIndex === chosenOriginalIndex;
            if (resultStatus) {
                resultStatus.textContent = correct ? 'Σωστό! 🎉' : 'Λάθος 😞';
                resultStatus.className = `result-status ${correct ? 'correct' : 'wrong'}`;
            }
            if (userChoice) {
                userChoice.innerHTML = `<strong>Η επιλογή σου:</strong> ${q.choices[chosenOriginalIndex]}`;
            }
            if (correctAnswer && !correct) {
                correctAnswer.innerHTML = `<strong>Σωστή απάντηση:</strong> ${q.choices[q.correctIndex]}`;
                correctAnswer.style.display = 'block';
            } else if (correctAnswer) {
                correctAnswer.style.display = 'none';
            }
            if (explanation && q.explanation) {
                explanation.textContent = q.explanation;
                explanation.style.display = 'block';
            } else if (explanation) {
                explanation.style.display = 'none';
            }
            
            // Set up external next button
            const externalNextBtn = document.getElementById('next-btn');
            if (externalNextBtn) {
                externalNextBtn.style.display = 'inline-block';
                externalNextBtn.disabled = false;
                externalNextBtn.onclick = () => {
                    currentQuestionIndex++;
                    if (currentQuestionIndex >= questions.length) {
                        showSessionSummary(true);
                    } else {
                        displayQuestion(currentQuestionIndex);
                    }
                };
            }
            
            // Hide submit button after answering
            const externalSubmitBtn = document.getElementById('submit-btn');
            if (externalSubmitBtn) {
                externalSubmitBtn.style.display = 'none';
                externalSubmitBtn.disabled = true;
            }
            return true;
        } catch (e) {
            return false;
        }
    }
    if (aSvgObj) {
        if (tryUpdateAnswerSVG()) return;
        aSvgObj.addEventListener('load', () => {
            setTimeout(() => tryUpdateAnswerSVG(), 300);
        }, { once: true });
    }
}

function selectChoiceInSVG(renderedIndex) {
    const q = questions[currentQuestionIndex];
    if (!q) return;
    const qSvgObj = document.getElementById('qSvg');
    if (qSvgObj && qSvgObj.contentDocument) {
        try {
            const svgDoc = qSvgObj.contentDocument;
            const foreignObject = svgDoc.querySelector('foreignObject');
            if (foreignObject) {
                const htmlBody = foreignObject.querySelector('body');
                if (htmlBody) {
                    const allBtns = htmlBody.querySelectorAll('.choice-btn');
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
        } catch (e) {}
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
    updateAnswerInSVG(q, chosenOriginalIndex);
    updateScore(false, correct);
}

function renderAnswerReview(q, chosenOriginalIndex, container) {
    const correct = q.correctIndex === chosenOriginalIndex;
    container.innerHTML = '';
    const userDiv = document.createElement('div');
    userDiv.className = 'user-answer';
    userDiv.innerHTML = `<strong>${correct ? 'Σωστό!' : 'Λάθος.'}</strong><br>Η επιλογή σου: ${q.choices[chosenOriginalIndex]}<br>`;
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
