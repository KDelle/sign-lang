/* ===================================
   SIGN LANGUAGE LEARNING GAME - JAVASCRIPT
   Main logic file with all functionality
   =================================== */

// ===================================
// LAUNCH SLIDE FUNCTION
// ===================================

function enterSite() {
    const launchSlide = document.getElementById('launchSlide');
    if (launchSlide) {
        launchSlide.classList.add('fade-out');
        
        // Remove the launch slide from DOM after animation
        setTimeout(() => {
            launchSlide.style.display = 'none';
        }, 800);
    }
}

// ===================================
// SIGN LANGUAGE DATA
// ===================================

// Alphabet signs (A-Z) with emoji representations
const alphabetSigns = [
    { id: 'a', name: 'A', visual: '✊', description: 'Closed fist with thumb to the side' },
    { id: 'b', name: 'B', visual: '🖐️', description: 'Open hand, fingers together, thumb across palm' },
    { id: 'c', name: 'C', visual: '👌', description: 'Curved hand forming a C shape' },
    { id: 'd', name: 'D', visual: '☝️', description: 'Index finger up, other fingers touching thumb' },
    { id: 'e', name: 'E', visual: '✊', description: 'Closed fist, fingers curled down' },
    { id: 'f', name: 'F', visual: '👌', description: 'Index and thumb touching, other fingers up' },
    { id: 'g', name: 'G', visual: '👈', description: 'Index finger and thumb extended sideways' },
    { id: 'h', name: 'H', visual: '🤞', description: 'Index and middle finger extended sideways' },
    { id: 'i', name: 'I', visual: '🤙', description: 'Pinky finger extended up' },
    { id: 'j', name: 'J', visual: '🤙', description: 'Pinky draws a J in the air' },
    { id: 'k', name: 'K', visual: '✌️', description: 'Index and middle finger up, thumb between them' },
    { id: 'l', name: 'L', visual: '👍', description: 'Index finger up, thumb extended' },
    { id: 'm', name: 'M', visual: '✊', description: 'Thumb under three fingers' },
    { id: 'n', name: 'N', visual: '✊', description: 'Thumb under two fingers' },
    { id: 'o', name: 'O', visual: '👌', description: 'Fingers and thumb form O shape' },
    { id: 'p', name: 'P', visual: '👇', description: 'Index and middle down, like K but downward' },
    { id: 'q', name: 'Q', visual: '👇', description: 'Index and thumb down, like G but downward' },
    { id: 'r', name: 'R', visual: '🤞', description: 'Index and middle crossed' },
    { id: 's', name: 'S', visual: '✊', description: 'Closed fist, thumb over fingers' },
    { id: 't', name: 'T', visual: '👊', description: 'Thumb between index and middle' },
    { id: 'u', name: 'U', visual: '✌️', description: 'Index and middle up together' },
    { id: 'v', name: 'V', visual: '✌️', description: 'Index and middle apart, forming V' },
    { id: 'w', name: 'W', visual: '🤟', description: 'Index, middle, and ring up' },
    { id: 'x', name: 'X', visual: '☝️', description: 'Index finger bent like hook' },
    { id: 'y', name: 'Y', visual: '🤙', description: 'Thumb and pinky extended' },
    { id: 'z', name: 'Z', visual: '☝️', description: 'Index finger draws Z in air' }
];

// Number signs (0-10)
const numberSigns = [
    { id: '0', name: '0', visual: '👌', description: 'Circle with thumb and index' },
    { id: '1', name: '1', visual: '☝️', description: 'Index finger up' },
    { id: '2', name: '2', visual: '✌️', description: 'Index and middle up' },
    { id: '3', name: '3', visual: '🤟', description: 'Thumb, index, and middle up' },
    { id: '4', name: '4', visual: '🖖', description: 'Four fingers up, thumb down' },
    { id: '5', name: '5', visual: '🖐️', description: 'All five fingers spread' },
    { id: '6', name: '6', visual: '🤙', description: 'Thumb and pinky touch, three up' },
    { id: '7', name: '7', visual: '🤘', description: 'Ring and pinky touch thumb, two up' },
    { id: '8', name: '8', visual: '🤞', description: 'Middle and ring touch thumb, two up' },
    { id: '9', name: '9', visual: '👌', description: 'Index touches thumb, four up' },
    { id: '10', name: '10', visual: '👊', description: 'Shake fist or show thumb (A + wiggle)' }
];

// Common greetings
const greetingSigns = [
    { id: 'hello', name: 'Hello', visual: '👋', description: 'Wave hand side to side' },
    { id: 'goodbye', name: 'Goodbye', visual: '👋', description: 'Wave hand up and down' },
    { id: 'please', name: 'Please', visual: '🤚', description: 'Rub hand in circle on chest' },
    { id: 'thankyou', name: 'Thank You', visual: '😊', description: 'Hand moves from chin forward' },
    { id: 'sorry', name: 'Sorry', visual: '✊', description: 'Fist circles on chest' },
    { id: 'yes', name: 'Yes', visual: '👍', description: 'Nod fist up and down' },
    { id: 'no', name: 'No', visual: '☝️', description: 'Index and middle snap together' },
    { id: 'help', name: 'Help', visual: '🆘', description: 'One hand lifts the other' }
];

// Common words
const commonSigns = [
    { id: 'eat', name: 'Eat', visual: '🍽️', description: 'Fingers to mouth repeatedly' },
    { id: 'drink', name: 'Drink', visual: '🥤', description: 'C hand to mouth like holding cup' },
    { id: 'sleep', name: 'Sleep', visual: '😴', description: 'Hand closes near cheek' },
    { id: 'home', name: 'Home', visual: '🏠', description: 'Fingertips touch at roof shape' },
    { id: 'work', name: 'Work', visual: '💼', description: 'Fists tap together' },
    { id: 'school', name: 'School', visual: '🏫', description: 'Clap hands twice' },
    { id: 'friend', name: 'Friend', visual: '👥', description: 'Hook index fingers together twice' },
    { id: 'family', name: 'Family', visual: '👨‍👩‍👧‍👦', description: 'F hands circle to connect' },
    { id: 'happy', name: 'Happy', visual: '😊', description: 'Brush chest upward twice' },
    { id: 'sad', name: 'Sad', visual: '😢', description: 'Hands slide down face' }
];

// Group all signs by category
const signCategories = {
    alphabet: alphabetSigns,
    numbers: numberSigns,
    greetings: greetingSigns,
    common: commonSigns
};

// ===================================
// GLOBAL STATE VARIABLES
// ===================================

let currentSection = 'home';
let currentCategory = null;
let currentSignIndex = 0;
let currentQuiz = null;
let quizScore = 0;
let currentQuestionIndex = 0;

// ===================================
// LOCAL STORAGE FUNCTIONS
// ===================================

// Initialize or get user progress from localStorage
function getProgress() {
    const defaultProgress = {
        learned: {
            alphabet: [],
            numbers: [],
            greetings: [],
            common: []
        },
        totalScore: 0,
        quizzesTaken: 0,
        achievements: []
    };
    
    const saved = localStorage.getItem('signLanguageProgress');
    return saved ? JSON.parse(saved) : defaultProgress;
}

// Save progress to localStorage
function saveProgress(progress) {
    localStorage.setItem('signLanguageProgress', JSON.stringify(progress));
}

// Mark a sign as learned
function markSignLearned(category, signId) {
    const progress = getProgress();
    if (!progress.learned[category].includes(signId)) {
        progress.learned[category].push(signId);
        saveProgress(progress);
    }
}

// Update quiz statistics
function updateQuizStats(score, total) {
    const progress = getProgress();
    progress.totalScore += score;
    progress.quizzesTaken += 1;
    
    // Check for achievements
    checkAchievements(progress);
    
    saveProgress(progress);
}

// Reset all progress
function resetProgress() {
    if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
        localStorage.removeItem('signLanguageProgress');
        updateHomeStats();
        updateProgressDisplay();
        updateCategoryProgress();
        alert('All progress has been reset!');
    }
}

// ===================================
// NAVIGATION FUNCTIONS
// ===================================

// Navigate between main sections
function navigateToSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionName) {
            btn.classList.add('active');
        }
    });
    
    currentSection = sectionName;
    
    // Special handling for different sections
    if (sectionName === 'home') {
        updateHomeStats();
    } else if (sectionName === 'practice') {
        showPracticeHome();
    } else if (sectionName === 'progress') {
        updateProgressDisplay();
    } else if (sectionName === 'lessons') {
        updateCategoryProgress();
    }
}

// Setup navigation event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            navigateToSection(this.dataset.section);
        });
    });
    
    // Initialize the app
    updateHomeStats();
    updateCategoryProgress();
});

// ===================================
// HOME SECTION FUNCTIONS
// ===================================

// Update statistics on home page
function updateHomeStats() {
    const progress = getProgress();
    
    // Calculate total signs learned
    const totalLearned = Object.values(progress.learned).reduce((sum, arr) => sum + arr.length, 0);
    
    // Update display
    document.getElementById('totalLearned').textContent = totalLearned;
    document.getElementById('totalScore').textContent = progress.totalScore;
    document.getElementById('quizzesTaken').textContent = progress.quizzesTaken;
}

// ===================================
// LESSON SECTION FUNCTIONS
// ===================================

// Show lesson detail for a category
function showLesson(category) {
    currentCategory = category;
    currentSignIndex = 0;
    
    // Hide category grid and show lesson detail
    document.querySelector('.lesson-categories').style.display = 'none';
    document.getElementById('lessonDetail').classList.remove('hidden');
    
    // Update lesson title
    const titles = {
        alphabet: 'Alphabet (A-Z)',
        numbers: 'Numbers (0-10)',
        greetings: 'Greetings & Manners',
        common: 'Common Words'
    };
    document.getElementById('lessonTitle').textContent = titles[category];
    
    // Display first sign
    displayCurrentSign();
}

// Hide lesson detail and return to categories
function hideLesson() {
    document.querySelector('.lesson-categories').style.display = 'grid';
    document.getElementById('lessonDetail').classList.add('hidden');
    currentCategory = null;
}

// Display the current sign in flashcard
function displayCurrentSign() {
    if (!currentCategory) return;
    
    const signs = signCategories[currentCategory];
    const sign = signs[currentSignIndex];
    
    // Update flashcard content
    document.getElementById('signVisual').textContent = sign.visual;
    document.getElementById('signName').textContent = sign.name;
    document.getElementById('signDescription').textContent = sign.description;
    
    // Update counter
    document.getElementById('cardCounter').textContent = `${currentSignIndex + 1} / ${signs.length}`;
    
    // Enable/disable navigation buttons
    document.getElementById('prevBtn').disabled = currentSignIndex === 0;
    document.getElementById('nextBtn').disabled = currentSignIndex === signs.length - 1;
    
    // Mark as learned
    markSignLearned(currentCategory, sign.id);
    updateCategoryProgress();
}

// Navigate to previous sign
function previousSign() {
    if (currentSignIndex > 0) {
        currentSignIndex--;
        displayCurrentSign();
    }
}

// Navigate to next sign
function nextSign() {
    const signs = signCategories[currentCategory];
    if (currentSignIndex < signs.length - 1) {
        currentSignIndex++;
        displayCurrentSign();
    }
}

// Update progress bars for each category
function updateCategoryProgress() {
    const progress = getProgress();
    
    Object.keys(signCategories).forEach(category => {
        const total = signCategories[category].length;
        const learned = progress.learned[category].length;
        const percentage = Math.round((learned / total) * 100);
        
        const progressBar = document.getElementById(`progress-${category}`);
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
    });
}

// ===================================
// QUIZ FUNCTIONS
// ===================================

// Start a quiz for current category
function startQuiz() {
    if (!currentCategory) return;
    
    // Switch to practice section
    navigateToSection('practice');
    
    // Hide practice home, show quiz view
    document.getElementById('practiceHome').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('quizView').classList.remove('hidden');
    
    // Initialize quiz
    const signs = signCategories[currentCategory];
    currentQuiz = {
        category: currentCategory,
        questions: generateQuizQuestions(signs),
        totalQuestions: 10
    };
    
    quizScore = 0;
    currentQuestionIndex = 0;
    
    // Update quiz header
    const categoryNames = {
        alphabet: 'Alphabet',
        numbers: 'Numbers',
        greetings: 'Greetings',
        common: 'Common Words'
    };
    document.getElementById('quizCategory').textContent = categoryNames[currentCategory];
    document.getElementById('totalQuestions').textContent = currentQuiz.totalQuestions;
    
    // Show first question
    showQuizQuestion();
}

// Generate quiz questions (random selection)
function generateQuizQuestions(signs) {
    const questions = [];
    const numQuestions = Math.min(10, signs.length);
    
    // Create a copy and shuffle
    const shuffled = [...signs].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numQuestions; i++) {
        const correctSign = shuffled[i];
        
        // Generate wrong options
        const wrongOptions = signs
            .filter(s => s.id !== correctSign.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        // Combine and shuffle options
        const options = [correctSign, ...wrongOptions].sort(() => Math.random() - 0.5);
        
        questions.push({
            correctSign: correctSign,
            options: options
        });
    }
    
    return questions;
}

// Display current quiz question
function showQuizQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    
    // Update question counter and score
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('quizScore').textContent = quizScore;
    
    // Display the sign
    document.getElementById('quizSignDisplay').textContent = question.correctSign.visual;
    
    // Generate option buttons
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option.name;
        button.onclick = () => selectAnswer(option.id === question.correctSign.id, button);
        optionsGrid.appendChild(button);
    });
    
    // Hide feedback
    document.getElementById('feedback').classList.add('hidden');
}

// Handle answer selection
function selectAnswer(isCorrect, buttonElement) {
    // Disable all option buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    // Show feedback
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden');
    
    if (isCorrect) {
        quizScore++;
        buttonElement.classList.add('correct');
        feedback.className = 'feedback correct';
        feedback.textContent = '✓ Correct! Great job!';
    } else {
        buttonElement.classList.add('incorrect');
        feedback.className = 'feedback incorrect';
        feedback.textContent = '✗ Incorrect. Try to remember this one!';
        
        // Highlight correct answer
        const correctSign = currentQuiz.questions[currentQuestionIndex].correctSign;
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.textContent === correctSign.name) {
                btn.classList.add('correct');
            }
        });
    }
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuiz.totalQuestions) {
            showQuizQuestion();
        } else {
            showQuizResults();
        }
    }, 1500);
}

// Show quiz results
function showQuizResults() {
    // Hide quiz view, show results
    document.getElementById('quizView').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');
    
    // Calculate percentage
    const percentage = Math.round((quizScore / currentQuiz.totalQuestions) * 100);
    
    // Update display
    document.getElementById('finalScore').textContent = quizScore;
    document.getElementById('finalTotal').textContent = currentQuiz.totalQuestions;
    document.getElementById('percentage').textContent = percentage + '%';
    
    // Show motivational message
    let message = '';
    if (percentage === 100) {
        message = '🌟 Perfect score! You\'re a sign language master!';
    } else if (percentage >= 80) {
        message = '🎉 Excellent work! Keep it up!';
    } else if (percentage >= 60) {
        message = '👍 Good job! Practice a bit more to master it!';
    } else {
        message = '💪 Keep practicing! You\'ll get better!';
    }
    document.getElementById('resultsMessage').textContent = message;
    
    // Update statistics
    updateQuizStats(quizScore, currentQuiz.totalQuestions);
}

// Retry the same quiz
function retryQuiz() {
    startQuiz();
}

// Exit quiz and return to practice home
function exitQuiz() {
    showPracticeHome();
}

// Show practice home screen
function showPracticeHome() {
    document.getElementById('quizView').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('practiceHome').classList.remove('hidden');
}

// ===================================
// PROGRESS SECTION FUNCTIONS
// ===================================

// Update progress displays
function updateProgressDisplay() {
    const progress = getProgress();
    
    // Calculate overall progress
    const totalSigns = Object.values(signCategories).reduce((sum, arr) => sum + arr.length, 0);
    const learnedSigns = Object.values(progress.learned).reduce((sum, arr) => sum + arr.length, 0);
    const overallPercentage = Math.round((learnedSigns / totalSigns) * 100);
    
    // Update circular progress
    document.getElementById('overallProgress').textContent = overallPercentage + '%';
    
    // Update SVG circle (circumference = 2 * π * r = 2 * π * 65 ≈ 408.4)
    const circumference = 408.4;
    const offset = circumference - (overallPercentage / 100) * circumference;
    document.getElementById('progressCircle').style.strokeDashoffset = offset;
    
    // Update category progress list
    const categoryProgressList = document.getElementById('categoryProgressList');
    categoryProgressList.innerHTML = '';
    
    const categoryNames = {
        alphabet: 'Alphabet',
        numbers: 'Numbers',
        greetings: 'Greetings',
        common: 'Common Words'
    };
    
    Object.keys(signCategories).forEach(category => {
        const total = signCategories[category].length;
        const learned = progress.learned[category].length;
        const percentage = Math.round((learned / total) * 100);
        
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        progressItem.innerHTML = `
            <div class="progress-item-header">
                <span class="progress-item-name">${categoryNames[category]}</span>
                <span class="progress-item-percentage">${learned}/${total} (${percentage}%)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        categoryProgressList.appendChild(progressItem);
    });
    
    // Update achievements
    displayAchievements(progress);
}

// ===================================
// ACHIEVEMENTS SYSTEM
// ===================================

// Define achievements
const achievements = [
    {
        id: 'first_sign',
        icon: '🎯',
        title: 'First Sign',
        description: 'Learn your first sign',
        condition: (progress) => {
            return Object.values(progress.learned).some(arr => arr.length > 0);
        }
    },
    {
        id: 'alphabet_master',
        icon: '🔤',
        title: 'Alphabet Master',
        description: 'Complete the alphabet category',
        condition: (progress) => {
            return progress.learned.alphabet.length === signCategories.alphabet.length;
        }
    },
    {
        id: 'number_guru',
        icon: '🔢',
        title: 'Number Guru',
        description: 'Complete the numbers category',
        condition: (progress) => {
            return progress.learned.numbers.length === signCategories.numbers.length;
        }
    },
    {
        id: 'social_butterfly',
        icon: '👋',
        title: 'Social Butterfly',
        description: 'Complete the greetings category',
        condition: (progress) => {
            return progress.learned.greetings.length === signCategories.greetings.length;
        }
    },
    {
        id: 'word_wizard',
        icon: '💬',
        title: 'Word Wizard',
        description: 'Complete the common words category',
        condition: (progress) => {
            return progress.learned.common.length === signCategories.common.length;
        }
    },
    {
        id: 'quiz_taker',
        icon: '📝',
        title: 'Quiz Taker',
        description: 'Complete your first quiz',
        condition: (progress) => {
            return progress.quizzesTaken >= 1;
        }
    },
    {
        id: 'dedicated_learner',
        icon: '⭐',
        title: 'Dedicated Learner',
        description: 'Complete 10 quizzes',
        condition: (progress) => {
            return progress.quizzesTaken >= 10;
        }
    },
    {
        id: 'sign_master',
        icon: '🏆',
        title: 'Sign Language Master',
        description: 'Complete all categories',
        condition: (progress) => {
            return Object.keys(signCategories).every(category => {
                return progress.learned[category].length === signCategories[category].length;
            });
        }
    }
];

// Check and unlock achievements
function checkAchievements(progress) {
    achievements.forEach(achievement => {
        if (!progress.achievements.includes(achievement.id) && achievement.condition(progress)) {
            progress.achievements.push(achievement.id);
            showAchievementNotification(achievement);
        }
    });
}

// Show achievement unlock notification
function showAchievementNotification(achievement) {
    // Simple alert for now (could be enhanced with custom modal)
    alert(`🎉 Achievement Unlocked!\n\n${achievement.icon} ${achievement.title}\n${achievement.description}`);
}

// Display achievements in progress section
function displayAchievements(progress) {
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = '';
    
    achievements.forEach(achievement => {
        const isUnlocked = progress.achievements.includes(achievement.id);
        
        const achievementItem = document.createElement('div');
        achievementItem.className = `achievement-item ${isUnlocked ? '' : 'locked'}`;
        achievementItem.innerHTML = `
            <div class="achievement-icon">${isUnlocked ? achievement.icon : '🔒'}</div>
            <div class="achievement-text">
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
            </div>
        `;
        achievementsList.appendChild(achievementItem);
    });
}

// ===================================
// INITIALIZATION
// ===================================

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sign Language Learning Game Initialized!');
    updateHomeStats();
    updateCategoryProgress();
});
