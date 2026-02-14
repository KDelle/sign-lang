/* ===================================
   SIGN LANGUAGE LEARNING GAME - COMPLETE
   With Password Authentication & Multi-User Support
   =================================== */

// ===================================
// USER DATABASE & AUTHENTICATION
// ===================================

// Get all users from localStorage
function getAllUsers() {
    const users = localStorage.getItem('signLanguageUsers');
    return users ? JSON.parse(users) : [];
}

// Save all users to localStorage
function saveAllUsers(users) {
    localStorage.setItem('signLanguageUsers', JSON.stringify(users));
}

// Hash password (simple hash for demo)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Find user by name
function findUserByName(name) {
    const users = getAllUsers();
    return users.find(user => user.name.toLowerCase() === name.toLowerCase());
}

// Check if user is already logged in
function checkUserSession() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        showMainApp(userData);
        return true;
    }
    return false;
}

// ===================================
// LOGIN PAGE FUNCTIONS
// ===================================

// Show login page (after launch slide)
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

// Toggle between new user and returning user forms
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

// Populate datalist with existing user names
function populateUserNamesList() {
    const users = getAllUsers();
    const datalist = document.getElementById('userNamesList');
    datalist.innerHTML = '';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.name;
        datalist.appendChild(option);
    });
}

// ===================================
// NEW USER SIGNUP
// ===================================

function handleNewUserSignup(event) {
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
    
    const existingUser = findUserByName(name);
    if (existingUser) {
        alert('A user with this name already exists! Please login or use a different name.');
        return;
    }
    
    const newUser = {
        name: name,
        course: course,
        year: year,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
        progress: {
            learned: {
                alphabet: [],
                numbers: [],
                greetings: [],
                common: []
            },
            totalScore: 0,
            quizzesTaken: 0,
            achievements: []
        }
    };
    
    const users = getAllUsers();
    users.push(newUser);
    saveAllUsers(users);
    
    const userData = {
        name: name,
        course: course,
        year: year
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    alert('Account created successfully! Welcome aboard! 🎉');
    showMainApp(userData);
}

// ===================================
// RETURNING USER LOGIN
// ===================================

function handleReturningUserLogin(event) {
    event.preventDefault();
    
    const name = document.getElementById('returningUserName').value.trim();
    const password = document.getElementById('returningUserPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    const user = findUserByName(name);
    
    if (!user) {
        errorDiv.textContent = 'User not found. Please check your name or create a new account.';
        errorDiv.classList.add('show');
        return;
    }
    
    if (user.password !== hashPassword(password)) {
        errorDiv.textContent = 'Incorrect password. Please try again.';
        errorDiv.classList.add('show');
        return;
    }
    
    errorDiv.classList.remove('show');
    
    const userData = {
        name: user.name,
        course: user.course,
        year: user.year
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    showMainApp(userData);
}

// ===================================
// SHOW MAIN APP
// ===================================

function showMainApp(userData) {
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainApp');
    
    loginPage.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    displayUserInfo(userData);
    loadUserProgress(userData.name);
    updateHomeStats();
    updateCategoryProgress();
}

// Display user info in header with logout button
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

// ===================================
// USER PROGRESS MANAGEMENT
// ===================================

function loadUserProgress(userName) {
    const users = getAllUsers();
    const user = users.find(u => u.name === userName);
    
    if (user && user.progress) {
        localStorage.setItem('signLanguageProgress', JSON.stringify(user.progress));
    }
}

function saveUserProgress() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const userData = JSON.parse(currentUser);
    const progress = getProgress();
    
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.name === userData.name);
    
    if (userIndex !== -1) {
        users[userIndex].progress = progress;
        users[userIndex].lastLogin = new Date().toISOString();
        saveAllUsers(users);
    }
}

// ===================================
// LOGOUT FUNCTION
// ===================================

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        saveUserProgress();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('signLanguageProgress');
        window.location.reload();
    }
}

// ===================================
// PAGE LOAD CHECK
// ===================================

window.addEventListener('DOMContentLoaded', function() {
    if (checkUserSession()) {
        document.getElementById('launchSlide').style.display = 'none';
        document.getElementById('loginPage').classList.add('hidden');
    }
});

window.addEventListener('beforeunload', function() {
    saveUserProgress();
});

window.addEventListener('DOMContentLoaded', function() {
    if (checkUserSession()) {
        // User is logged in, hide launch slide and login, show main app
        document.getElementById('launchSlide').style.display = 'none';
        document.getElementById('loginPage').classList.add('hidden');
    }
});

// ===================================
// SIGN LANGUAGE DATA
// ===================================
/* ===================================
   MULTI-LANGUAGE SIGN LANGUAGE SYSTEM
   ASL + FSL (Filipino Sign Language)
   Add this AFTER the authentication code, BEFORE the existing sign data
   =================================== */

// ===================================
// CURRENT LANGUAGE STATE
// ===================================

let currentLanguage = 'asl'; // Default to ASL

// ===================================
// FILIPINO SIGN LANGUAGE (FSL) DATA
// ===================================

const fslAlphabetSigns = [
    { id: 'a', name: 'A', visual: '✊', description: 'Closed fist, similar to ASL but thumb may be more forward' },
    { id: 'b', name: 'B', visual: '🖐️', description: 'Open hand with fingers together, thumb folded' },
    { id: 'c', name: 'C', visual: '👌', description: 'Curved hand forming C shape' },
    { id: 'd', name: 'D', visual: '☝️', description: 'Index finger pointing up, middle touches thumb' },
    { id: 'e', name: 'E', visual: '✊', description: 'Closed fist with fingers curled inward' },
    { id: 'f', name: 'F', visual: '👌', description: 'Thumb and index form circle, other fingers extended' },
    { id: 'g', name: 'G', visual: '👈', description: 'Index and thumb point sideways' },
    { id: 'h', name: 'H', visual: '🤞', description: 'Index and middle extended horizontally' },
    { id: 'i', name: 'I', visual: '🤙', description: 'Pinky extended upward' },
    { id: 'j', name: 'J', visual: '🤙', description: 'Pinky draws J shape in air' },
    { id: 'k', name: 'K', visual: '✌️', description: 'Index and middle up, thumb between' },
    { id: 'l', name: 'L', visual: '👍', description: 'L shape with index and thumb' },
    { id: 'm', name: 'M', visual: '✊', description: 'Thumb tucked under three fingers' },
    { id: 'n', name: 'N', visual: '✊', description: 'Thumb under first two fingers' },
    { id: 'o', name: 'O', visual: '👌', description: 'Fingers form O with thumb' },
    { id: 'p', name: 'P', visual: '👇', description: 'K shape pointing downward' },
    { id: 'q', name: 'Q', visual: '👇', description: 'G shape pointing down' },
    { id: 'r', name: 'R', visual: '🤞', description: 'Crossed index and middle fingers' },
    { id: 's', name: 'S', visual: '✊', description: 'Fist with thumb over fingers' },
    { id: 't', name: 'T', visual: '👊', description: 'Thumb between index and middle' },
    { id: 'u', name: 'U', visual: '✌️', description: 'Index and middle together, pointing up' },
    { id: 'v', name: 'V', visual: '✌️', description: 'Index and middle spread in V' },
    { id: 'w', name: 'W', visual: '🤟', description: 'Three fingers extended (index, middle, ring)' },
    { id: 'x', name: 'X', visual: '☝️', description: 'Index finger bent like hook' },
    { id: 'y', name: 'Y', visual: '🤙', description: 'Thumb and pinky extended (hang loose)' },
    { id: 'z', name: 'Z', visual: '☝️', description: 'Index traces Z in the air' }
];

const fslNumberSigns = [
    { id: '0', name: '0', visual: '👌', description: 'O shape with thumb and fingers' },
    { id: '1', name: '1', visual: '☝️', description: 'Index finger pointing up' },
    { id: '2', name: '2', visual: '✌️', description: 'Index and middle fingers up' },
    { id: '3', name: '3', visual: '🤟', description: 'Thumb, index, middle up' },
    { id: '4', name: '4', visual: '🖖', description: 'Four fingers extended' },
    { id: '5', name: '5', visual: '🖐️', description: 'All five fingers spread open' },
    { id: '6', name: '6', visual: '🤙', description: 'Thumb and pinky touch, others folded' },
    { id: '7', name: '7', visual: '🤘', description: 'Ring and pinky touch thumb' },
    { id: '8', name: '8', visual: '🤞', description: 'Middle and ring touch thumb' },
    { id: '9', name: '9', visual: '👌', description: 'Index touches thumb, four fingers up' },
    { id: '10', name: '10', visual: '👊', description: 'Fist with slight shake' }
];

const fslGreetingSigns = [
    { id: 'hello', name: 'Kumusta (Hello)', visual: '👋', description: 'Wave hand or touch forehead then move forward' },
    { id: 'goodbye', name: 'Paalam (Goodbye)', visual: '👋', description: 'Wave hand back and forth' },
    { id: 'please', name: 'Paki (Please)', visual: '🤚', description: 'Hand flat, circular motion on chest' },
    { id: 'thankyou', name: 'Salamat (Thank You)', visual: '😊', description: 'Hand moves from lips/chin forward' },
    { id: 'sorry', name: 'Pasensya (Sorry)', visual: '✊', description: 'Fist circles on chest, apologetic' },
    { id: 'yes', name: 'Oo (Yes)', visual: '👍', description: 'Nod fist or head movement' },
    { id: 'no', name: 'Hindi (No)', visual: '☝️', description: 'Shake head or finger wag' },
    { id: 'help', name: 'Tulong (Help)', visual: '🆘', description: 'One hand supports/lifts the other' },
    { id: 'welcome', name: 'Walang Anuman (Welcome)', visual: '🤗', description: 'Open arms gesture' },
    { id: 'goodmorning', name: 'Magandang Umaga', visual: '🌅', description: 'Sign for "good" + "morning"' }
];

const fslCommonSigns = [
    { id: 'eat', name: 'Kain (Eat)', visual: '🍽️', description: 'Fingers to mouth repeatedly' },
    { id: 'drink', name: 'Inom (Drink)', visual: '🥤', description: 'Hand mimics holding cup to mouth' },
    { id: 'sleep', name: 'Tulog (Sleep)', visual: '😴', description: 'Hand closes near face/cheek' },
    { id: 'home', name: 'Bahay (Home)', visual: '🏠', description: 'Hands form roof shape' },
    { id: 'work', name: 'Trabaho (Work)', visual: '💼', description: 'Fists tap or move in working motion' },
    { id: 'school', name: 'Eskwela (School)', visual: '🏫', description: 'Hands clap or book shape' },
    { id: 'friend', name: 'Kaibigan (Friend)', visual: '👥', description: 'Hook fingers together or shake' },
    { id: 'family', name: 'Pamilya (Family)', visual: '👨‍👩‍👧‍👦', description: 'F-hands or arms encircle' },
    { id: 'happy', name: 'Masaya (Happy)', visual: '😊', description: 'Smile gesture, hands brush chest up' },
    { id: 'sad', name: 'Malungkot (Sad)', visual: '😢', description: 'Hands slide down face' },
    { id: 'love', name: 'Mahal (Love)', visual: '❤️', description: 'Hands cross over heart' },
    { id: 'beautiful', name: 'Maganda (Beautiful)', visual: '✨', description: 'Hand circles face appreciatively' }
];

// ===================================
// ORIGINAL ASL DATA (Keep your existing data)
// ===================================

const aslAlphabetSigns = [
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

const aslNumberSigns = [
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

const aslGreetingSigns = [
    { id: 'hello', name: 'Hello', visual: '👋', description: 'Wave hand side to side' },
    { id: 'goodbye', name: 'Goodbye', visual: '👋', description: 'Wave hand up and down' },
    { id: 'please', name: 'Please', visual: '🤚', description: 'Rub hand in circle on chest' },
    { id: 'thankyou', name: 'Thank You', visual: '😊', description: 'Hand moves from chin forward' },
    { id: 'sorry', name: 'Sorry', visual: '✊', description: 'Fist circles on chest' },
    { id: 'yes', name: 'Yes', visual: '👍', description: 'Nod fist up and down' },
    { id: 'no', name: 'No', visual: '☝️', description: 'Index and middle snap together' },
    { id: 'help', name: 'Help', visual: '🆘', description: 'One hand lifts the other' }
];

const aslCommonSigns = [
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

// ===================================
// LANGUAGE-SPECIFIC SIGN CATEGORIES
// ===================================

const languageData = {
    asl: {
        alphabet: aslAlphabetSigns,
        numbers: aslNumberSigns,
        greetings: aslGreetingSigns,
        common: aslCommonSigns,
        fullName: 'American Sign Language',
        shortName: 'ASL',
        flag: '🇺🇸'
    },
    fsl: {
        alphabet: fslAlphabetSigns,
        numbers: fslNumberSigns,
        greetings: fslGreetingSigns,
        common: fslCommonSigns,
        fullName: 'Filipino Sign Language',
        shortName: 'FSL',
        flag: '🇵🇭'
    }
};

// Update the global signCategories to use current language
let signCategories = languageData[currentLanguage];

// ===================================
// LANGUAGE SWITCHING FUNCTION
// ===================================

function switchLanguage(language) {
    currentLanguage = language;
    signCategories = languageData[language];
    
    // Save language preference
    localStorage.setItem('selectedLanguage', language);
    
    // Update UI text
    updateLanguageUI();
    
    // Reset current lesson/quiz if active
    if (currentCategory) {
        hideLesson();
    }
    
    // Update progress display
    updateCategoryProgress();
    updateHomeStats();
    
    // Show notification
    const langName = languageData[language].fullName;
    alert(`✅ Language changed to ${langName}!`);
}

function updateLanguageUI() {
    const lang = languageData[currentLanguage];
    
    // Update welcome text
    const welcomeText = document.getElementById('welcomeText');
    if (welcomeText) {
        welcomeText.textContent = `Learn the basics of ${lang.fullName} (${lang.shortName}) through interactive lessons and fun games.`;
    }
    
    // Update rhythm game title
    const rhythmTitle = document.getElementById('rhythmGameTitle');
    if (rhythmTitle) {
        rhythmTitle.textContent = `🎵 ${lang.shortName} Rhythm Game`;
    }
    
    // Update category descriptions
    updateCategoryDescriptions();
}

function updateCategoryDescriptions() {
    const lang = languageData[currentLanguage];
    const shortName = lang.shortName;
    
    // Update lesson category cards
    const categories = document.querySelectorAll('.category-card');
    if (categories.length >= 4) {
        categories[0].querySelector('p').textContent = `Learn A-Z in ${shortName}`;
        categories[1].querySelector('p').textContent = `Learn 0-10 in ${shortName}`;
        categories[2].querySelector('p').textContent = `Common greetings`;
        categories[3].querySelector('p').textContent = `Everyday words`;
    }
}

// ===================================
// LOAD SAVED LANGUAGE ON STARTUP
// ===================================

window.addEventListener('DOMContentLoaded', function() {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && languageData[savedLanguage]) {
        currentLanguage = savedLanguage;
        signCategories = languageData[currentLanguage];
        
        // Update select dropdown
        const select = document.getElementById('languageSelect');
        if (select) {
            select.value = savedLanguage;
        }
        
        updateLanguageUI();
    }
});

// ===================================
// UPDATE PROGRESS SYSTEM FOR MULTI-LANGUAGE
// ===================================

// Override getProgress to handle multiple languages
const _originalGetProgress = getProgress;
function getProgress() {
    const defaultProgress = {
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
    
    const saved = localStorage.getItem('signLanguageProgress');
    if (!saved) return defaultProgress;
    
    const progress = JSON.parse(saved);
    
    // Migrate old single-language progress to new format
    if (!progress.asl && !progress.fsl) {
        return {
            asl: progress,
            fsl: defaultProgress.fsl
        };
    }
    
    return progress;
}

// Override markSignLearned for multi-language
function markSignLearned(category, signId) {
    const progress = getProgress();
    if (!progress[currentLanguage].learned[category].includes(signId)) {
        progress[currentLanguage].learned[category].push(signId);
        saveProgress(progress);
    }
}

// Override updateQuizStats for multi-language
function updateQuizStats(score, total) {
    const progress = getProgress();
    progress[currentLanguage].totalScore += score;
    progress[currentLanguage].quizzesTaken += 1;
    checkAchievements(progress[currentLanguage]);
    saveProgress(progress);
}

// Override updateHomeStats for multi-language
function updateHomeStats() {
    const progress = getProgress();
    const langProgress = progress[currentLanguage];
    const totalLearned = Object.values(langProgress.learned).reduce((sum, arr) => sum + arr.length, 0);
    
    document.getElementById('totalLearned').textContent = totalLearned;
    document.getElementById('totalScore').textContent = langProgress.totalScore;
    document.getElementById('quizzesTaken').textContent = langProgress.quizzesTaken;
}

// ===================================
// NAVIGATION FUNCTIONS
// ===================================

function navigateToSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(sectionName).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionName) {
            btn.classList.add('active');
        }
    });
    
    currentSection = sectionName;
    
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

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            navigateToSection(this.dataset.section);
        });
    });
});

// ===================================
// HOME SECTION FUNCTIONS
// ===================================

function updateHomeStats() {
    const progress = getProgress();
    const totalLearned = Object.values(progress.learned).reduce((sum, arr) => sum + arr.length, 0);
    
    document.getElementById('totalLearned').textContent = totalLearned;
    document.getElementById('totalScore').textContent = progress.totalScore;
    document.getElementById('quizzesTaken').textContent = progress.quizzesTaken;
}

// ===================================
// LESSON SECTION FUNCTIONS
// ===================================

function showLesson(category) {
    currentCategory = category;
    currentSignIndex = 0;
    
    document.querySelector('.lesson-categories').style.display = 'none';
    document.getElementById('lessonDetail').classList.remove('hidden');
    
    const titles = {
        alphabet: 'Alphabet (A-Z)',
        numbers: 'Numbers (0-10)',
        greetings: 'Greetings & Manners',
        common: 'Common Words'
    };
    document.getElementById('lessonTitle').textContent = titles[category];
    
    displayCurrentSign();
}

function hideLesson() {
    document.querySelector('.lesson-categories').style.display = 'grid';
    document.getElementById('lessonDetail').classList.add('hidden');
    currentCategory = null;
}

function displayCurrentSign() {
    if (!currentCategory) return;
    
    const signs = signCategories[currentCategory];
    const sign = signs[currentSignIndex];
    
    document.getElementById('signVisual').textContent = sign.visual;
    document.getElementById('signName').textContent = sign.name;
    document.getElementById('signDescription').textContent = sign.description;
    document.getElementById('cardCounter').textContent = `${currentSignIndex + 1} / ${signs.length}`;
    
    document.getElementById('prevBtn').disabled = currentSignIndex === 0;
    document.getElementById('nextBtn').disabled = currentSignIndex === signs.length - 1;
    
    markSignLearned(currentCategory, sign.id);
    updateCategoryProgress();
}

function previousSign() {
    if (currentSignIndex > 0) {
        currentSignIndex--;
        displayCurrentSign();
    }
}

function nextSign() {
    const signs = signCategories[currentCategory];
    if (currentSignIndex < signs.length - 1) {
        currentSignIndex++;
        displayCurrentSign();
    }
}

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

function startQuiz() {
    if (!currentCategory) return;
    
    navigateToSection('practice');
    
    document.getElementById('practiceHome').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('quizView').classList.remove('hidden');
    
    const signs = signCategories[currentCategory];
    currentQuiz = {
        category: currentCategory,
        questions: generateQuizQuestions(signs),
        totalQuestions: 10
    };
    
    quizScore = 0;
    currentQuestionIndex = 0;
    
    const categoryNames = {
        alphabet: 'Alphabet',
        numbers: 'Numbers',
        greetings: 'Greetings',
        common: 'Common Words'
    };
    document.getElementById('quizCategory').textContent = categoryNames[currentCategory];
    document.getElementById('totalQuestions').textContent = currentQuiz.totalQuestions;
    
    showQuizQuestion();
}

function generateQuizQuestions(signs) {
    const questions = [];
    const numQuestions = Math.min(10, signs.length);
    const shuffled = [...signs].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numQuestions; i++) {
        const correctSign = shuffled[i];
        const wrongOptions = signs
            .filter(s => s.id !== correctSign.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        const options = [correctSign, ...wrongOptions].sort(() => Math.random() - 0.5);
        
        questions.push({
            correctSign: correctSign,
            options: options
        });
    }
    
    return questions;
}

function showQuizQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('quizScore').textContent = quizScore;
    document.getElementById('quizSignDisplay').textContent = question.correctSign.visual;
    
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option.name;
        button.onclick = () => selectAnswer(option.id === question.correctSign.id, button);
        optionsGrid.appendChild(button);
    });
    
    document.getElementById('feedback').classList.add('hidden');
}

function selectAnswer(isCorrect, buttonElement) {
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
    });
    
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
        
        const correctSign = currentQuiz.questions[currentQuestionIndex].correctSign;
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.textContent === correctSign.name) {
                btn.classList.add('correct');
            }
        });
    }
    
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuiz.totalQuestions) {
            showQuizQuestion();
        } else {
            showQuizResults();
        }
    }, 1500);
}

function showQuizResults() {
    document.getElementById('quizView').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');
    
    const percentage = Math.round((quizScore / currentQuiz.totalQuestions) * 100);
    
    document.getElementById('finalScore').textContent = quizScore;
    document.getElementById('finalTotal').textContent = currentQuiz.totalQuestions;
    document.getElementById('percentage').textContent = percentage + '%';
    
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
    
    updateQuizStats(quizScore, currentQuiz.totalQuestions);
}

function retryQuiz() {
    startQuiz();
}

function exitQuiz() {
    showPracticeHome();
}

function showPracticeHome() {
    document.getElementById('quizView').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('practiceHome').classList.remove('hidden');
}

// ===================================
// PROGRESS SECTION FUNCTIONS
// ===================================

function updateProgressDisplay() {
    const progress = getProgress();
    
    const totalSigns = Object.values(signCategories).reduce((sum, arr) => sum + arr.length, 0);
    const learnedSigns = Object.values(progress.learned).reduce((sum, arr) => sum + arr.length, 0);
    const overallPercentage = Math.round((learnedSigns / totalSigns) * 100);
    
    document.getElementById('overallProgress').textContent = overallPercentage + '%';
    
    const circumference = 408.4;
    const offset = circumference - (overallPercentage / 100) * circumference;
    document.getElementById('progressCircle').style.strokeDashoffset = offset;
    
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
    
    displayAchievements(progress);
}

// ===================================
// ACHIEVEMENTS SYSTEM
// ===================================

const achievements = [
    {
        id: 'first_sign',
        icon: '🎯',
        title: 'First Sign',
        description: 'Learn your first sign',
        condition: (progress) => Object.values(progress.learned).some(arr => arr.length > 0)
    },
    {
        id: 'alphabet_master',
        icon: '🔤',
        title: 'Alphabet Master',
        description: 'Complete the alphabet category',
        condition: (progress) => progress.learned.alphabet.length === signCategories.alphabet.length
    },
    {
        id: 'number_guru',
        icon: '🔢',
        title: 'Number Guru',
        description: 'Complete the numbers category',
        condition: (progress) => progress.learned.numbers.length === signCategories.numbers.length
    },
    {
        id: 'social_butterfly',
        icon: '👋',
        title: 'Social Butterfly',
        description: 'Complete the greetings category',
        condition: (progress) => progress.learned.greetings.length === signCategories.greetings.length
    },
    {
        id: 'word_wizard',
        icon: '💬',
        title: 'Word Wizard',
        description: 'Complete the common words category',
        condition: (progress) => progress.learned.common.length === signCategories.common.length
    },
    {
        id: 'quiz_taker',
        icon: '📝',
        title: 'Quiz Taker',
        description: 'Complete your first quiz',
        condition: (progress) => progress.quizzesTaken >= 1
    },
    {
        id: 'dedicated_learner',
        icon: '⭐',
        title: 'Dedicated Learner',
        description: 'Complete 10 quizzes',
        condition: (progress) => progress.quizzesTaken >= 10
    },
    {
        id: 'sign_master',
        icon: '🏆',
        title: 'Sign Language Master',
        description: 'Complete all categories',
        condition: (progress) => Object.keys(signCategories).every(category => 
            progress.learned[category].length === signCategories[category].length
        )
    }
];

function checkAchievements(progress) {
    achievements.forEach(achievement => {
        if (!progress.achievements.includes(achievement.id) && achievement.condition(progress)) {
            progress.achievements.push(achievement.id);
            showAchievementNotification(achievement);
        }
    });
}

function showAchievementNotification(achievement) {
    alert(`🎉 Achievement Unlocked!\n\n${achievement.icon} ${achievement.title}\n${achievement.description}`);
}

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
/* ===================================
   ASL RHYTHM GAME
   Add this to the end of your script.js file
   =================================== */

// ===================================
// RHYTHM GAME STATE
// ===================================

let rhythmGame = {
    isPlaying: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    fallingSign: null,
    gameSpeed: 3000, // milliseconds for sign to fall
    spawnInterval: null,
    animationFrame: null,
    category: 'alphabet'
};

// ===================================
// RHYTHM GAME FUNCTIONS
// ===================================

function startRhythmGame(category = 'alphabet') {
    rhythmGame.category = category;
    rhythmGame.isPlaying = true;
    rhythmGame.score = 0;
    rhythmGame.combo = 0;
    rhythmGame.maxCombo = 0;
    
    // Hide practice home and show rhythm game
    document.getElementById('practiceHome').classList.add('hidden');
    document.getElementById('rhythmGame').classList.remove('hidden');
    
    // Update UI
    updateRhythmGameUI();
    
    // Start spawning signs
    spawnFallingSign();
    rhythmGame.spawnInterval = setInterval(spawnFallingSign, rhythmGame.gameSpeed);
}

function spawnFallingSign() {
    if (!rhythmGame.isPlaying) return;
    
    const signs = signCategories[rhythmGame.category];
    const correctSign = signs[Math.floor(Math.random() * signs.length)];
    
    // Generate wrong options
    const wrongOptions = signs
        .filter(s => s.id !== correctSign.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
    
    // Shuffle all options
    const allOptions = [correctSign, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    rhythmGame.fallingSign = {
        sign: correctSign,
        options: allOptions,
        position: 0,
        startTime: Date.now()
    };
    
    // Display the falling sign
    displayFallingSign();
    
    // Animate the sign falling
    animateFallingSign();
}

function displayFallingSign() {
    const signElement = document.getElementById('fallingSign');
    const optionsContainer = document.getElementById('rhythmOptions');
    
    signElement.textContent = rhythmGame.fallingSign.sign.visual;
    signElement.style.top = '0%';
    
    // Generate option buttons
    optionsContainer.innerHTML = '';
    rhythmGame.fallingSign.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'rhythm-option-btn';
        button.textContent = option.name;
        button.onclick = () => checkRhythmAnswer(option.id === rhythmGame.fallingSign.sign.id);
        optionsContainer.appendChild(button);
    });
}

function animateFallingSign() {
    if (!rhythmGame.isPlaying || !rhythmGame.fallingSign) return;
    
    const elapsed = Date.now() - rhythmGame.fallingSign.startTime;
    const progress = Math.min(elapsed / rhythmGame.gameSpeed, 1);
    
    rhythmGame.fallingSign.position = progress * 100;
    
    const signElement = document.getElementById('fallingSign');
    signElement.style.top = rhythmGame.fallingSign.position + '%';
    
    // Check if sign reached bottom (missed)
    if (progress >= 1) {
        missedSign();
        return;
    }
    
    // Continue animation
    rhythmGame.animationFrame = requestAnimationFrame(animateFallingSign);
}

function checkRhythmAnswer(isCorrect) {
    if (!rhythmGame.fallingSign) return;
    
    cancelAnimationFrame(rhythmGame.animationFrame);
    
    const signElement = document.getElementById('fallingSign');
    const feedbackElement = document.getElementById('rhythmFeedback');
    
    if (isCorrect) {
        // Correct answer!
        rhythmGame.score += 10;
        rhythmGame.combo++;
        rhythmGame.maxCombo = Math.max(rhythmGame.maxCombo, rhythmGame.combo);
        
        // Show correct feedback
        signElement.classList.add('rhythm-correct');
        feedbackElement.textContent = '✓ Perfect!';
        feedbackElement.className = 'rhythm-feedback show correct';
        
        // Speed up slightly
        rhythmGame.gameSpeed = Math.max(2000, rhythmGame.gameSpeed - 50);
    } else {
        // Wrong answer
        rhythmGame.combo = 0;
        
        signElement.classList.add('rhythm-wrong');
        feedbackElement.textContent = '✗ Wrong!';
        feedbackElement.className = 'rhythm-feedback show wrong';
    }
    
    updateRhythmGameUI();
    
    // Clear and prepare for next
    setTimeout(() => {
        signElement.classList.remove('rhythm-correct', 'rhythm-wrong');
        feedbackElement.classList.remove('show');
        rhythmGame.fallingSign = null;
    }, 300);
}

function missedSign() {
    if (!rhythmGame.fallingSign) return;
    
    rhythmGame.combo = 0;
    
    const feedbackElement = document.getElementById('rhythmFeedback');
    feedbackElement.textContent = 'Missed!';
    feedbackElement.className = 'rhythm-feedback show wrong';
    
    updateRhythmGameUI();
    
    setTimeout(() => {
        feedbackElement.classList.remove('show');
        rhythmGame.fallingSign = null;
    }, 300);
}

function updateRhythmGameUI() {
    document.getElementById('rhythmScore').textContent = rhythmGame.score;
    document.getElementById('rhythmCombo').textContent = rhythmGame.combo;
}

function stopRhythmGame() {
    rhythmGame.isPlaying = false;
    clearInterval(rhythmGame.spawnInterval);
    cancelAnimationFrame(rhythmGame.animationFrame);
    
    // Show results
    showRhythmGameResults();
}

function showRhythmGameResults() {
    document.getElementById('rhythmGame').classList.add('hidden');
    document.getElementById('rhythmResults').classList.remove('hidden');
    
    document.getElementById('rhythmFinalScore').textContent = rhythmGame.score;
    document.getElementById('rhythmMaxCombo').textContent = rhythmGame.maxCombo;
    
    let message = '';
    if (rhythmGame.score >= 100) {
        message = '🌟 Amazing! You have great rhythm!';
    } else if (rhythmGame.score >= 50) {
        message = '🎉 Good job! Keep practicing!';
    } else {
        message = '💪 Nice try! Practice makes perfect!';
    }
    document.getElementById('rhythmResultMessage').textContent = message;
}

function retryRhythmGame() {
    document.getElementById('rhythmResults').classList.add('hidden');
    startRhythmGame(rhythmGame.category);
}

function exitRhythmGame() {
    rhythmGame.isPlaying = false;
    clearInterval(rhythmGame.spawnInterval);
    cancelAnimationFrame(rhythmGame.animationFrame);
    
    document.getElementById('rhythmGame').classList.add('hidden');
    document.getElementById('rhythmResults').classList.add('hidden');
    document.getElementById('practiceHome').classList.remove('hidden');
}

function showPracticeHome() {
    // Stop any running games
    if (rhythmGame.isPlaying) {
        rhythmGame.isPlaying = false;
        clearInterval(rhythmGame.spawnInterval);
        cancelAnimationFrame(rhythmGame.animationFrame);
    }
    
    document.getElementById('quizView').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('rhythmGame').classList.add('hidden');
    document.getElementById('rhythmResults').classList.add('hidden');
    document.getElementById('practiceHome').classList.remove('hidden');
}

// ===================================
// OVERRIDE SAVEPROGRESS TO SAVE TO USER DATABASE
// ===================================

// Wrap the existing saveProgress function
const _originalSaveProgress = typeof saveProgress !== 'undefined' ? saveProgress : function(progress) {
    localStorage.setItem('signLanguageProgress', JSON.stringify(progress));
};

function saveProgress(progress) {
    // Save to session storage
    if (progress) {
        localStorage.setItem('signLanguageProgress', JSON.stringify(progress));
    }
    // Also save to user database
    saveUserProgress();
}
