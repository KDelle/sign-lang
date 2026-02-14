/* ===================================
   SUPABASE CONFIGURATION
   =================================== */
''
/* ===================================
   AUTHENTICATION FUNCTIONS
   =================================== */

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

async function checkUserSession() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        await showMainApp(userData);
        return true;
    }
    return false;
}

function showLoginPage() {
    const launchSlide = document.getElementById('launchSlide');
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainApp');
    
    launchSlide.classList.add('fade-out');
    setTimeout(() => {
        launchSlide.style.display = 'none';
    }, 800);
    
    setTimeout(() => {
        loginPage.classList.remove('hidden');
        populateUserNamesList();
    }, 500);
    
    mainApp.classList.add('hidden');
}

function showNewUserForm() {
    document.getElementById('newUserForm').classList.remove('hidden');
    document.getElementById('returningUserForm').classList.add('hidden');
    document.getElementById('newUserBtn').classList.add('active');
    document.getElementById('returningUserBtn').classList.remove('active');
    document.getElementById('loginSubtext').textContent = 'Create your account to get started';
}

function showReturningUserForm() {
    document.getElementById('newUserForm').classList.add('hidden');
    document.getElementById('returningUserForm').classList.remove('hidden');
    document.getElementById('newUserBtn').classList.remove('active');
    document.getElementById('returningUserBtn').classList.add('active');
    document.getElementById('loginSubtext').textContent = 'Welcome back! Please login';
    populateUserNamesList();
}

async function populateUserNamesList() {
    const datalist = document.getElementById('userNamesList');
    datalist.innerHTML = '';
    
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('name')
            .order('name');
        
        if (error) throw error;
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.name;
            datalist.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading user names:', error);
    }
}

async function handleNewUserSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('newUserName').value.trim();
    const course = document.getElementById('newUserCourse').value.trim();
    const year = document.getElementById('newUserYear').value;
    const password = document.getElementById('newUserPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match! Please try again.');
        return;
    }
    
    try {
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .ilike('name', name)
            .single();
        
        if (existingUser) {
            alert('A user with this name already exists! Please login or use a different name.');
            return;
        }
        
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                {
                    name: name,
                    course: course,
                    year: year,
                    password: hashPassword(password)
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        
        const userData = {
            id: newUser.id,
            name: name,
            course: course,
            year: year
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        alert('Account created successfully! Welcome aboard! 🎉');
        await showMainApp(userData);
        
    } catch (error) {
        console.error('Signup error:', error);
        alert('Error creating account. Please try again.');
    }
}

async function handleReturningUserLogin(event) {
    event.preventDefault();
    
    const name = document.getElementById('returningUserName').value.trim();
    const password = document.getElementById('returningUserPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .ilike('name', name)
            .single();
        
        if (error || !user) {
            errorDiv.textContent = 'User not found. Please check your name or create a new account.';
            errorDiv.classList.add('show');
            return;
        }
        
        if (user.password !== hashPassword(password)) {
            errorDiv.textContent = 'Incorrect password. Please try again.';
            errorDiv.classList.add('show');
            return;
        }
        
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);
        
        errorDiv.classList.remove('show');
        
        const userData = {
            id: user.id,
            name: user.name,
            course: user.course,
            year: user.year
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        await showMainApp(userData);
        
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Login failed. Please try again.';
        errorDiv.classList.add('show');
    }
}

async function showMainApp(userData) {
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainApp');
    
    loginPage.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    displayUserInfo(userData);
    await loadUserProgress(userData.id);
    updateHomeStats();
    updateCategoryProgress();
}

function displayUserInfo(userData) {
    const userInfoDiv = document.getElementById('userInfo');
    userInfoDiv.innerHTML = `
        <div class="user-info-text">
            <p><strong>Welcome, ${userData.name}!</strong></p>
            <p>${userData.course} - ${userData.year}</p>
        </div>
        <button class="logout-btn" onclick="logout()">🚪 Logout</button>
    `;
}

async function loadUserProgress(userId) {
    try {
        const { data: progressData, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId);
        
        if (error) throw error;
        
        const progress = {
            asl: {
                learned: { alphabet: [], numbers: [], greetings: [], common: [] },
                totalScore: 0,
                quizzesTaken: 0,
                achievements: []
            },
            fsl: {
                learned: { alphabet: [], numbers: [], greetings: [], common: [] },
                totalScore: 0,
                quizzesTaken: 0,
                achievements: []
            }
        };
        
        progressData.forEach(row => {
            const lang = row.language;
            const cat = row.category;
            
            if (progress[lang]) {
                progress[lang].learned[cat] = row.signs_learned || [];
                progress[lang].totalScore += row.total_score || 0;
                progress[currentLanguage].quizzesTaken += row.quizzes_taken || 0;
                progress[lang].achievements = row.achievements || [];
            }
        });
        
        localStorage.setItem('signLanguageProgress', JSON.stringify(progress));
        
    } catch (error) {
        console.error('Error loading progress:', error);
        const emptyProgress = {
            asl: {
                learned: { alphabet: [], numbers: [], greetings: [], common: [] },
                totalScore: 0,
                quizzesTaken: 0,
                achievements: []
            },
            fsl: {
                learned: { alphabet: [], numbers: [], greetings: [], common: [] },
                totalScore: 0,
                quizzesTaken: 0,
                achievements: []
            }
        };
        localStorage.setItem('signLanguageProgress', JSON.stringify(emptyProgress));
    }
}

async function saveUserProgress() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const userData = JSON.parse(currentUser);
    const progress = getProgress();
    
    try {
        for (const lang of ['asl', 'fsl']) {
            const langProgress = progress[lang];
            
            for (const category of ['alphabet', 'numbers', 'greetings', 'common']) {
                await supabase
                    .from('user_progress')
                    .upsert({
                        user_id: userData.id,
                        language: lang,
                        category: category,
                        signs_learned: langProgress.learned[category],
                        total_score: langProgress.totalScore,
                        quizzes_taken: langProgress.quizzesTaken,
                        achievements: langProgress.achievements,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id,language,category'
                    });
            }
        }
        
        console.log('Progress saved to cloud ✅');
        
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        await saveUserProgress();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('signLanguageProgress');
        window.location.reload();
    }
}

window.addEventListener('DOMContentLoaded', async function() {
    if (await checkUserSession()) {
        document.getElementById('launchSlide').style.display = 'none';
        document.getElementById('loginPage').classList.add('hidden');
    }
    
    // Add navigation listeners
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });
});

window.addEventListener('beforeunload', async function() {
    await saveUserProgress();
});

setInterval(async () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        await saveUserProgress();
    }
}, 30000);

/* ===================================
   SIGN LANGUAGE GAME LOGIC
   =================================== */

// Sign language data with emojis as placeholders
const signLanguageData = {
    asl: {
        alphabet: [
            { sign: '🅰️', name: 'A', description: 'Closed fist with thumb to the side' },
            { sign: '🅱️', name: 'B', description: 'Flat hand with fingers up and together' },
            { sign: '🌊', name: 'C', description: 'Curved hand forming letter C' },
            { sign: '☝️', name: 'D', description: 'Index finger up, other fingers touching thumb' },
            { sign: '✋', name: 'E', description: 'Fingers curved down, touching thumb' },
            { sign: '👌', name: 'F', description: 'Thumb and index form circle, others up' },
            { sign: '👍', name: 'G', description: 'Closed fist, thumb pointing sideways' },
            { sign: '✌️', name: 'H', description: 'Index and middle finger sideways' },
            { sign: '🤙', name: 'I', description: 'Pinky up, others closed' },
            { sign: '🤞', name: 'J', description: 'Pinky up, tracing J shape' },
            { sign: '🖖', name: 'K', description: 'Index and middle up in V, thumb between' },
            { sign: '👆', name: 'L', description: 'L shape with thumb and index' },
            { sign: '👊', name: 'M', description: 'Closed fist, thumb under fingers' },
            { sign: '🤟', name: 'N', description: 'Thumb under first two fingers' },
            { sign: '⭕', name: 'O', description: 'Fingers form circle' },
            { sign: '🫰', name: 'P', description: 'Like K but pointing down' },
            { sign: '👇', name: 'Q', description: 'Fist pointing down, thumb down' },
            { sign: '🫱', name: 'R', description: 'Index and middle crossed' },
            { sign: '✊', name: 'S', description: 'Closed fist, thumb over fingers' },
            { sign: '🫳', name: 'T', description: 'Thumb between index and middle' },
            { sign: '🤘', name: 'U', description: 'Index and middle together, pointing up' },
            { sign: '🫴', name: 'V', description: 'Index and middle apart in V' },
            { sign: '🫷', name: 'W', description: 'Three fingers up' },
            { sign: '🫸', name: 'X', description: 'Bent index finger' },
            { sign: '🤙', name: 'Y', description: 'Thumb and pinky out' },
            { sign: '👉', name: 'Z', description: 'Index finger traces Z' }
        ],
        numbers: [
            { sign: '👊', name: '0', description: 'Closed fist forming O' },
            { sign: '☝️', name: '1', description: 'Index finger up' },
            { sign: '✌️', name: '2', description: 'Index and middle up' },
            { sign: '🤟', name: '3', description: 'Thumb, index, and middle up' },
            { sign: '🖖', name: '4', description: 'Four fingers up, thumb in' },
            { sign: '✋', name: '5', description: 'All five fingers spread' },
            { sign: '🤙', name: '6', description: 'Thumb and pinky touching' },
            { sign: '👌', name: '7', description: 'Ring, middle, index up' },
            { sign: '🤞', name: '8', description: 'Thumb, middle, ring up' },
            { sign: '👍', name: '9', description: 'Thumb, ring, pinky up' },
            { sign: '🙌', name: '10', description: 'Shake fist or show 1-0' }
        ],
        greetings: [
            { sign: '👋', name: 'Hello', description: 'Wave hand back and forth' },
            { sign: '🙋', name: 'Hi', description: 'Open palm, wave fingers' },
            { sign: '😊', name: 'Good Morning', description: 'Flat hand from mouth moving up' },
            { sign: '🌅', name: 'Good Afternoon', description: 'Flat hand at elbow level' },
            { sign: '🌙', name: 'Good Night', description: 'Flat hand moving down' },
            { sign: '🙏', name: 'Thank You', description: 'Flat hand from chin forward' },
            { sign: '🤝', name: 'Nice to meet you', description: 'Shake hands gesture' },
            { sign: '👋', name: 'Goodbye', description: 'Wave goodbye' },
            { sign: '👍', name: 'Good', description: 'Thumb up' },
            { sign: '❤️', name: 'Love', description: 'Cross arms over chest' }
        ],
        common: [
            { sign: '👨', name: 'Man', description: 'Thumb from forehead to chin' },
            { sign: '👩', name: 'Woman', description: 'Thumb from chin to chest' },
            { sign: '👶', name: 'Baby', description: 'Rock arms like holding baby' },
            { sign: '🏠', name: 'Home', description: 'Fingertips touch forming roof' },
            { sign: '🍎', name: 'Eat', description: 'Fingertips to mouth' },
            { sign: '💧', name: 'Water', description: 'W shape at mouth' },
            { sign: '🚗', name: 'Car', description: 'Hands steering wheel' },
            { sign: '🏫', name: 'School', description: 'Clap hands twice' },
            { sign: '📚', name: 'Book', description: 'Palms together, open like book' },
            { sign: '⏰', name: 'Time', description: 'Point to wrist' },
            { sign: '✅', name: 'Yes', description: 'Fist nods like head' },
            { sign: '❌', name: 'No', description: 'Index and middle snap shut' },
            { sign: '❓', name: 'What', description: 'Shake open hands side to side' },
            { sign: '❔', name: 'Where', description: 'Point and move side to side' },
            { sign: '🤔', name: 'Why', description: 'Touch forehead, move forward' }
        ]
    },
    fsl: {
        alphabet: [
            { sign: '🅰️', name: 'A', description: 'Closed fist with thumb on side' },
            { sign: '🅱️', name: 'B', description: 'Flat hand, fingers up together' },
            { sign: '🌊', name: 'C', description: 'Curved hand forming C' },
            { sign: '☝️', name: 'D', description: 'Index up, others closed' },
            { sign: '✋', name: 'E', description: 'Curved fingers touching thumb' },
            { sign: '👌', name: 'F', description: 'Thumb and index circle' },
            { sign: '👍', name: 'G', description: 'Fist, thumb sideways' },
            { sign: '✌️', name: 'H', description: 'Index and middle sideways' },
            { sign: '🤙', name: 'I', description: 'Pinky up only' },
            { sign: '🤞', name: 'J', description: 'Pinky traces J' },
            { sign: '🖖', name: 'K', description: 'V with thumb between' },
            { sign: '👆', name: 'L', description: 'L shape' },
            { sign: '👊', name: 'M', description: 'Fist thumb under' },
            { sign: '🤟', name: 'N', description: 'Thumb under two fingers' },
            { sign: '⭕', name: 'O', description: 'Circle with fingers' },
            { sign: '🫰', name: 'P', description: 'K pointing down' },
            { sign: '👇', name: 'Q', description: 'Fist pointing down' },
            { sign: '🫱', name: 'R', description: 'Crossed fingers' },
            { sign: '✊', name: 'S', description: 'Fist thumb over' },
            { sign: '🫳', name: 'T', description: 'Thumb between fingers' },
            { sign: '🤘', name: 'U', description: 'Two fingers together up' },
            { sign: '🫴', name: 'V', description: 'Two fingers apart V' },
            { sign: '🫷', name: 'W', description: 'Three fingers up' },
            { sign: '🫸', name: 'X', description: 'Bent index' },
            { sign: '🤙', name: 'Y', description: 'Thumb and pinky out' },
            { sign: '👉', name: 'Z', description: 'Trace Z with finger' }
        ],
        numbers: [
            { sign: '👊', name: '0', description: 'Closed fist' },
            { sign: '☝️', name: '1', description: 'One finger up' },
            { sign: '✌️', name: '2', description: 'Two fingers' },
            { sign: '🤟', name: '3', description: 'Three fingers' },
            { sign: '🖖', name: '4', description: 'Four fingers' },
            { sign: '✋', name: '5', description: 'Five spread' },
            { sign: '🤙', name: '6', description: 'Thumb and pinky' },
            { sign: '👌', name: '7', description: 'Three fingers up' },
            { sign: '🤞', name: '8', description: 'Three different fingers' },
            { sign: '👍', name: '9', description: 'Thumb and two fingers' },
            { sign: '🙌', name: '10', description: 'Both hands or 1-0' }
        ],
        greetings: [
            { sign: '👋', name: 'Kumusta (Hello)', description: 'Wave hand' },
            { sign: '🙋', name: 'Magandang Umaga (Good Morning)', description: 'Hand from mouth up' },
            { sign: '🌅', name: 'Magandang Hapon (Good Afternoon)', description: 'Hand at elbow' },
            { sign: '🌙', name: 'Magandang Gabi (Good Evening)', description: 'Hand down' },
            { sign: '🙏', name: 'Salamat (Thank You)', description: 'Hand from chin forward' },
            { sign: '🤝', name: 'Maligayang pagkakilala (Nice to meet you)', description: 'Handshake' },
            { sign: '👋', name: 'Paalam (Goodbye)', description: 'Wave' },
            { sign: '👍', name: 'Mabuti (Good)', description: 'Thumbs up' },
            { sign: '❤️', name: 'Mahal (Love)', description: 'Arms crossed on chest' },
            { sign: '😊', name: 'Oo (Yes)', description: 'Nod fist' }
        ],
        common: [
            { sign: '👨', name: 'Lalaki (Man)', description: 'Thumb forehead to chin' },
            { sign: '👩', name: 'Babae (Woman)', description: 'Thumb chin to chest' },
            { sign: '👶', name: 'Sanggol (Baby)', description: 'Rock arms' },
            { sign: '🏠', name: 'Bahay (Home)', description: 'Roof shape' },
            { sign: '🍎', name: 'Kain (Eat)', description: 'Hand to mouth' },
            { sign: '💧', name: 'Tubig (Water)', description: 'W at mouth' },
            { sign: '🚗', name: 'Sasakyan (Car)', description: 'Steering motion' },
            { sign: '🏫', name: 'Paaralan (School)', description: 'Clap twice' },
            { sign: '📚', name: 'Libro (Book)', description: 'Open palms like book' },
            { sign: '⏰', name: 'Oras (Time)', description: 'Point to wrist' },
            { sign: '✅', name: 'Oo (Yes)', description: 'Fist nods' },
            { sign: '❌', name: 'Hindi (No)', description: 'Fingers snap' },
            { sign: '❓', name: 'Ano (What)', description: 'Shake hands' },
            { sign: '❔', name: 'Saan (Where)', description: 'Point side to side' },
            { sign: '🤔', name: 'Bakit (Why)', description: 'Touch forehead forward' }
        ]
    }
};

// Current state
let currentLanguage = 'asl';
let currentCategory = '';
let currentSignIndex = 0;
let currentQuiz = {
    category: '',
    questions: [],
    currentQuestion: 0,
    score: 0,
    isActive: false
};
let rhythmGameState = {
    isActive: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    interval: null
};

// Helper functions
function getProgress() {
    const progress = localStorage.getItem('signLanguageProgress');
    if (progress) {
        return JSON.parse(progress);
    }
    return {
        asl: {
            learned: { alphabet: [], numbers: [], greetings: [], common: [] },
            totalScore: 0,
            quizzesTaken: 0,
            achievements: []
        },
        fsl: {
            learned: { alphabet: [], numbers: [], greetings: [], common: [] },
            totalScore: 0,
            quizzesTaken: 0,
            achievements: []
        }
    };
}

function saveProgress(progress) {
    localStorage.setItem('signLanguageProgress', JSON.stringify(progress));
    saveUserProgress();
}

function markSignAsLearned(sign) {
    const progress = getProgress();
    if (!progress[currentLanguage].learned[currentCategory].includes(sign)) {
        progress[currentLanguage].learned[currentCategory].push(sign);
        saveProgress(progress);
    }
}

// Navigation
function navigateToSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(section).classList.add('active');
    const navBtn = document.querySelector(`[data-section="${section}"]`);
    if (navBtn) navBtn.classList.add('active');
    
    if (section === 'practice') {
        showPracticeHome();
    }
}

function switchLanguage(lang) {
    currentLanguage = lang;
    const welcomeText = document.getElementById('welcomeText');
    if (lang === 'asl') {
        welcomeText.textContent = 'Learn the basics of American Sign Language (ASL) through interactive lessons and fun games.';
    } else {
        welcomeText.textContent = 'Learn the basics of Filipino Sign Language (FSL) through interactive lessons and fun games.';
    }
    updateHomeStats();
    updateCategoryProgress();
}

// Stats update
function updateHomeStats() {
    const progress = getProgress();
    const langProgress = progress[currentLanguage];
    
    let totalLearned = 0;
    for (let category in langProgress.learned) {
        totalLearned += langProgress.learned[category].length;
    }
    
    document.getElementById('totalLearned').textContent = totalLearned;
    document.getElementById('totalScore').textContent = langProgress.totalScore;
    document.getElementById('quizzesTaken').textContent = langProgress.quizzesTaken;
}

function updateCategoryProgress() {
    const progress = getProgress();
    const langProgress = progress[currentLanguage];
    
    const categories = ['alphabet', 'numbers', 'greetings', 'common'];
    const categoryTotals = {
        'alphabet': 26,
        'numbers': 11,
        'greetings': 10,
        'common': 15
    };
    
    categories.forEach(category => {
        const learned = langProgress.learned[category].length;
        const total = categoryTotals[category];
        const percentage = (learned / total) * 100;
        
        const progressBar = document.getElementById(`progress-${category}`);
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    });
}

// Lesson functions
function showLesson(category) {
    currentCategory = category;
    currentSignIndex = 0;
    
    document.querySelector('.lesson-categories').style.display = 'none';
    document.getElementById('lessonDetail').classList.remove('hidden');
    
    const signs = signLanguageData[currentLanguage][category];
    document.getElementById('lessonTitle').textContent = 
        category.charAt(0).toUpperCase() + category.slice(1);
    
    displayCurrentSign();
}

function hideLesson() {
    document.querySelector('.lesson-categories').style.display = 'grid';
    document.getElementById('lessonDetail').classList.add('hidden');
}

function displayCurrentSign() {
    const signs = signLanguageData[currentLanguage][currentCategory];
    const sign = signs[currentSignIndex];
    
    document.getElementById('signVisual').textContent = sign.sign;
    document.getElementById('signName').textContent = sign.name;
    document.getElementById('signDescription').textContent = sign.description;
    document.getElementById('cardCounter').textContent = 
        `${currentSignIndex + 1} / ${signs.length}`;
    
    markSignAsLearned(sign.name);
    updateHomeStats();
    updateCategoryProgress();
}

function nextSign() {
    const signs = signLanguageData[currentLanguage][currentCategory];
    if (currentSignIndex < signs.length - 1) {
        currentSignIndex++;
        displayCurrentSign();
    }
}

function previousSign() {
    if (currentSignIndex > 0) {
        currentSignIndex--;
        displayCurrentSign();
    }
}

// Quiz functions
function startQuiz() {
    const signs = signLanguageData[currentLanguage][currentCategory];
    
    // Generate quiz questions
    currentQuiz.category = currentCategory;
    currentQuiz.questions = [];
    currentQuiz.currentQuestion = 0;
    currentQuiz.score = 0;
    currentQuiz.isActive = true;
    
    // Create 10 random questions
    for (let i = 0; i < Math.min(10, signs.length); i++) {
        const correctSign = signs[Math.floor(Math.random() * signs.length)];
        const wrongSigns = signs
            .filter(s => s.name !== correctSign.name)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        const options = [correctSign, ...wrongSigns]
            .sort(() => 0.5 - Math.random());
        
        currentQuiz.questions.push({
            sign: correctSign,
            options: options
        });
    }
    
    // Navigate to practice section and show quiz
    navigateToSection('practice');
    document.getElementById('practiceHome').classList.add('hidden');
    document.getElementById('quizView').classList.remove('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    
    displayQuizQuestion();
}

function displayQuizQuestion() {
    const question = currentQuiz.questions[currentQuiz.currentQuestion];
    
    document.getElementById('quizCategory').textContent = 
        currentQuiz.category.charAt(0).toUpperCase() + currentQuiz.category.slice(1);
    document.getElementById('currentQuestion').textContent = currentQuiz.currentQuestion + 1;
    document.getElementById('totalQuestions').textContent = currentQuiz.questions.length;
    document.getElementById('quizScore').textContent = currentQuiz.score;
    
    document.getElementById('quizSignDisplay').textContent = question.sign.sign;
    
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option.name;
        button.onclick = () => checkAnswer(option.name, question.sign.name);
        optionsGrid.appendChild(button);
    });
}

function checkAnswer(selected, correct) {
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden');
    
    if (selected === correct) {
        feedback.textContent = '✅ Correct!';
        feedback.style.color = '#4CAF50';
        currentQuiz.score++;
    } else {
        feedback.textContent = `❌ Wrong! The correct answer is: ${correct}`;
        feedback.style.color = '#f44336';
    }
    
    document.getElementById('quizScore').textContent = currentQuiz.score;
    
    // Disable options
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correct) {
            btn.style.background = '#4CAF50';
            btn.style.color = 'white';
        }
    });
    
    // Move to next question after delay
    setTimeout(() => {
        feedback.classList.add('hidden');
        currentQuiz.currentQuestion++;
        
        if (currentQuiz.currentQuestion < currentQuiz.questions.length) {
            displayQuizQuestion();
        } else {
            showQuizResults();
        }
    }, 2000);
}

function showQuizResults() {
    document.getElementById('quizView').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');
    
    const score = currentQuiz.score;
    const total = currentQuiz.questions.length;
    const percentage = Math.round((score / total) * 100);
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalTotal').textContent = total;
    document.getElementById('percentage').textContent = `${percentage}%`;
    
    let message = '';
    if (percentage >= 90) message = '🌟 Excellent! You\'re a signing superstar!';
    else if (percentage >= 70) message = '👍 Great job! Keep practicing!';
    else if (percentage >= 50) message = '👌 Good effort! You\'re improving!';
    else message = '💪 Keep trying! Practice makes perfect!';
    
    document.getElementById('resultsMessage').textContent = message;
    
    // Update progress
    const progress = getProgress();
    progress[currentLanguage].totalScore += score;
    progress[currentLanguage].quizzesTaken++;
    saveProgress(progress);
    updateHomeStats();
}

function retryQuiz() {
    startQuiz();
}

function exitQuiz() {
    currentQuiz.isActive = false;
    showPracticeHome();
}

// Rhythm game functions
function startRhythmGame(category) {
    currentCategory = category;
    rhythmGameState = {
        isActive: true,
        score: 0,
        combo: 0,
        maxCombo: 0,
        interval: null
    };
    
    document.getElementById('practiceHome').classList.add('hidden');
    document.getElementById('rhythmGame').classList.remove('hidden');
    document.getElementById('rhythmResults').classList.add('hidden');
    
    const title = currentLanguage === 'asl' ? 'ASL Rhythm Game' : 'FSL Rhythm Game';
    document.getElementById('rhythmGameTitle').textContent = `🎵 ${title}`;
    
    updateRhythmDisplay();
    startRhythmGameLoop();
}

function updateRhythmDisplay() {
    document.getElementById('rhythmScore').textContent = rhythmGameState.score;
    document.getElementById('rhythmCombo').textContent = rhythmGameState.combo;
}

function startRhythmGameLoop() {
    const signs = signLanguageData[currentLanguage][currentCategory];
    let questionCount = 0;
    const maxQuestions = 15;
    
    function nextRound() {
        if (!rhythmGameState.isActive || questionCount >= maxQuestions) {
            stopRhythmGame();
            return;
        }
        
        const correctSign = signs[Math.floor(Math.random() * signs.length)];
        const wrongSigns = signs
            .filter(s => s.name !== correctSign.name)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        const options = [correctSign, ...wrongSigns]
            .sort(() => 0.5 - Math.random());
        
        document.getElementById('fallingSign').textContent = correctSign.sign;
        
        const optionsDiv = document.getElementById('rhythmOptions');
        optionsDiv.innerHTML = '';
        
        let answered = false;
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'rhythm-option-btn';
            button.textContent = option.name;
            button.onclick = () => {
                if (answered) return;
                answered = true;
                checkRhythmAnswer(option.name, correctSign.name, nextRound);
            };
            optionsDiv.appendChild(button);
        });
        
        questionCount++;
        
        // Auto-advance after 3 seconds if no answer
        rhythmGameState.timeout = setTimeout(() => {
            if (!answered) {
                answered = true;
                rhythmGameState.combo = 0;
                document.getElementById('rhythmFeedback').textContent = '⏰ Too slow!';
                setTimeout(() => {
                    document.getElementById('rhythmFeedback').textContent = '';
                    nextRound();
                }, 1000);
            }
        }, 3000);
    }
    
    nextRound();
}

function checkRhythmAnswer(selected, correct, callback) {
    clearTimeout(rhythmGameState.timeout);
    
    const feedback = document.getElementById('rhythmFeedback');
    
    if (selected === correct) {
        rhythmGameState.score += 10;
        rhythmGameState.combo++;
        if (rhythmGameState.combo > rhythmGameState.maxCombo) {
            rhythmGameState.maxCombo = rhythmGameState.combo;
        }
        rhythmGameState.score += rhythmGameState.combo; // Bonus points for combo
        feedback.textContent = '✅ Correct! +' + (10 + rhythmGameState.combo);
        feedback.style.color = '#4CAF50';
    } else {
        rhythmGameState.combo = 0;
        feedback.textContent = '❌ Wrong!';
        feedback.style.color = '#f44336';
    }
    
    updateRhythmDisplay();
    
    setTimeout(() => {
        feedback.textContent = '';
        callback();
    }, 1000);
}

function stopRhythmGame() {
    rhythmGameState.isActive = false;
    clearTimeout(rhythmGameState.timeout);
    
    document.getElementById('rhythmGame').classList.add('hidden');
    document.getElementById('rhythmResults').classList.remove('hidden');
    
    document.getElementById('rhythmFinalScore').textContent = rhythmGameState.score;
    document.getElementById('rhythmMaxCombo').textContent = rhythmGameState.maxCombo;
    
    let message = '';
    if (rhythmGameState.score >= 200) message = '🌟 Amazing! Perfect rhythm!';
    else if (rhythmGameState.score >= 150) message = '🎵 Great timing!';
    else if (rhythmGameState.score >= 100) message = '👍 Good job!';
    else message = '💪 Keep practicing!';
    
    document.getElementById('rhythmResultMessage').textContent = message;
    
    // Update progress
    const progress = getProgress();
    progress[currentLanguage].totalScore += Math.floor(rhythmGameState.score / 10);
    saveProgress(progress);
    updateHomeStats();
}

function retryRhythmGame() {
    startRhythmGame(currentCategory);
}

function exitRhythmGame() {
    rhythmGameState.isActive = false;
    clearTimeout(rhythmGameState.timeout);
    showPracticeHome();
}

function showPracticeHome() {
    document.getElementById('practiceHome').classList.remove('hidden');
    document.getElementById('quizView').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('rhythmGame').classList.add('hidden');
    document.getElementById('rhythmResults').classList.add('hidden');
}

// Progress functions
function resetProgress() {
    if (confirm('Are you sure you want to reset ALL your progress? This cannot be undone!')) {
        const emptyProgress = {
            asl: {
                learned: { alphabet: [], numbers: [], greetings: [], common: [] },
                totalScore: 0,
                quizzesTaken: 0,
                achievements: []
            },
            fsl: {
                learned: { alphabet: [], numbers: [], greetings: [], common: [] },
                totalScore: 0,
                quizzesTaken: 0,
                achievements: []
            }
        };
        saveProgress(emptyProgress);
        updateHomeStats();
        updateCategoryProgress();
        alert('Progress has been reset!');
    }
}
