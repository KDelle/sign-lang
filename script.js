function displayUserInfo(userData) {
    const userInfoDiv = document.getElementById('userInfo');
    userInfoDiv.innerHTML = '';
    
    const userInfoText = document.createElement('div');
    userInfoText.className = 'user-info-text';
    
    const welcomeP = document.createElement('p');
    const welcomeStrong = document.createElement('strong');
    
    let displayName;
    if (userData.firstName) {
        displayName = userData.firstName;
    } else {
        displayName = userData.name.split(' ')[0];
    }
    
    welcomeStrong.textContent = `Welcome, ${displayName}!`;
    welcomeP.appendChild(welcomeStrong);
    
    const courseP = document.createElement('p');
    courseP.textContent = `${userData.course} - ${userData.year}`;
    
    userInfoText.appendChild(welcomeP);
    userInfoText.appendChild(courseP);
    
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'logout-btn';
    logoutBtn.textContent = '🚪 Logout';
    logoutBtn.onclick = logout;
    
    userInfoDiv.appendChild(userInfoText);
    userInfoDiv.appendChild(logoutBtn);
}




function getFullName(userData) {
    if (userData.firstName && userData.lastName) {
        if (userData.middleName) {
            return `${userData.firstName} ${userData.middleName} ${userData.lastName}`;
        }
        return `${userData.firstName} ${userData.lastName}`;
    }
    return userData.name;
}




function migrateOldUserData() {
    const users = getAllUsers();
    let needsSave = false;
    
    users.forEach(user => {
        if (!user.firstName && user.name) {
            const nameParts = user.name.trim().split(' ');
            
            if (nameParts.length === 2) {
                user.firstName = nameParts[0];
                user.middleName = '';
                user.lastName = nameParts[1];
            } else if (nameParts.length === 3) {
                user.firstName = nameParts[0];
                user.middleName = nameParts[1];
                user.lastName = nameParts[2];
            } else if (nameParts.length > 3) {
                user.firstName = nameParts[0];
                user.middleName = nameParts.slice(1, -1).join(' ');
                user.lastName = nameParts[nameParts.length - 1];
            } else {
                user.firstName = nameParts[0];
                user.middleName = '';
                user.lastName = '';
            }
            
            needsSave = true;
        }
    });
    
    if (needsSave) {
        saveAllUsers(users);
        console.log('User data migrated to new format');
    }
}


document.addEventListener('DOMContentLoaded', function() {
    migrateOldUserData();
});
function getAllUsers() {
    const users = localStorage.getItem('signLanguageUsers');
    return users ? JSON.parse(users) : [];
}
function saveAllUsers(users) {
    localStorage.setItem('signLanguageUsers', JSON.stringify(users));
}
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}
function findUserByName(name) {
    const users = getAllUsers();
    return users.find(user => user.name.toLowerCase() === name.toLowerCase());
}
function checkUserSession() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        return true;
    }
    return false;
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
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        saveUserProgress();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('signLanguageProgress');
        localStorage.removeItem('currentSection');
        window.location.href = 'index.html';
    }
}
window.addEventListener('beforeunload', function() {
    saveUserProgress();
});
let currentLanguage = 'asl'; 
let currentCategory = null;
let currentSignIndex = 0;
let currentSection = 'home';
let quizScore = 0;
let currentQuestionIndex = 0;
let currentQuiz = null;
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
let signCategories = languageData[currentLanguage];
async function switchLanguage(language) {
    currentLanguage = language;
    signCategories = languageData[language];
    localStorage.setItem('selectedLanguage', language);
    if (window.StatsDB && window.StatsDB.save) {
        await window.StatsDB.save();
    }
    updateLanguageUI();
    if (currentCategory) {
        hideLesson();
    }
    updateCategoryProgress();
    updateHomeStats();
    const langName = languageData[language].fullName;
    alert(`✅ Language changed to ${langName}!`);
}
function updateLanguageUI() {
    const lang = languageData[currentLanguage];
    const welcomeText = document.getElementById('welcomeText');
    if (welcomeText) {
        welcomeText.textContent = `Learn the basics of ${lang.fullName} (${lang.shortName}) through interactive lessons and fun games.`;
    }
    const rhythmTitle = document.getElementById('rhythmGameTitle');
    if (rhythmTitle) {
        rhythmTitle.textContent = `🎵 ${lang.shortName} Rhythm Game`;
    }
    updateCategoryDescriptions();
}
function updateCategoryDescriptions() {
    const lang = languageData[currentLanguage];
    const shortName = lang.shortName;
    const alphabetCard = document.querySelector('.category-card[data-category="alphabet"]');
    const numbersCard = document.querySelector('.category-card[data-category="numbers"]');
    const greetingsCard = document.querySelector('.category-card[data-category="greetings"]');
    const commonCard = document.querySelector('.category-card[data-category="common"]');
    if (alphabetCard) {
        alphabetCard.querySelector('p').textContent = `Learn A-Z in ${shortName}`;
    }
    if (numbersCard) {
        numbersCard.querySelector('p').textContent = `Learn 0-10 in ${shortName}`;
    }
    if (greetingsCard) {
        greetingsCard.querySelector('p').textContent = `Common greetings`;
    }
    if (commonCard) {
        commonCard.querySelector('p').textContent = `Everyday vocabulary`;
    }
}
window.addEventListener('DOMContentLoaded', function() {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && languageData[savedLanguage]) {
        currentLanguage = savedLanguage;
        signCategories = languageData[currentLanguage];
        const select = document.getElementById('languageSelect');
        if (select) {
            select.value = savedLanguage;
        }
        updateLanguageUI();
    }
});
function getProgress() {
    const defaultProgress = {
        asl: {
            learned: { alphabet: [], numbers: [], greetings: [], common: [] },
            totalScore: 0,
            quizzesTaken: 0,
            achievements: [],
            rhythmGameStats: {
                totalGamesPlayed: 0,
                highScore: 0,
                totalScore: 0
            }
        },
        fsl: {
            learned: { alphabet: [], numbers: [], greetings: [], common: [] },
            totalScore: 0,
            quizzesTaken: 0,
            achievements: [],
            rhythmGameStats: {
                totalGamesPlayed: 0,
                highScore: 0,
                totalScore: 0
            }
        }
    };
    const saved = localStorage.getItem('signLanguageProgress');
    if (!saved) return defaultProgress;
    const progress = JSON.parse(saved);
    if (!progress.asl && !progress.fsl) {
        const migratedProgress = {
            asl: {
                learned: progress.learned || defaultProgress.asl.learned,
                totalScore: progress.totalScore || 0,
                quizzesTaken: progress.quizzesTaken || 0,
                achievements: progress.achievements || [],
                rhythmGameStats: progress.rhythmGameStats || defaultProgress.asl.rhythmGameStats
            },
            fsl: defaultProgress.fsl
        };
        return migratedProgress;
    }
    const mergedProgress = {
        asl: {
            learned: progress.asl?.learned || defaultProgress.asl.learned,
            totalScore: progress.asl?.totalScore || 0,
            quizzesTaken: progress.asl?.quizzesTaken || 0,
            achievements: progress.asl?.achievements || [],
            rhythmGameStats: progress.asl?.rhythmGameStats || defaultProgress.asl.rhythmGameStats
        },
        fsl: {
            learned: progress.fsl?.learned || defaultProgress.fsl.learned,
            totalScore: progress.fsl?.totalScore || 0,
            quizzesTaken: progress.fsl?.quizzesTaken || 0,
            achievements: progress.fsl?.achievements || [],
            rhythmGameStats: progress.fsl?.rhythmGameStats || defaultProgress.fsl.rhythmGameStats
        }
    };
    return mergedProgress;
}
async function markSignLearned(category, signId) {
    const progress = getProgress();
    const isNewSign = !progress[currentLanguage].learned[category].includes(signId);
    if (isNewSign) {
        progress[currentLanguage].learned[category].push(signId);
        await checkAchievements(progress[currentLanguage]);
        const updatedProgress = getProgress();
        saveProgress(updatedProgress);
    }
}
async function updateQuizStats(score, total) {
    const progress = getProgress();
    progress[currentLanguage].totalScore += score;
    progress[currentLanguage].quizzesTaken += 1;
    await checkAchievements(progress[currentLanguage]);
    const updatedProgress = getProgress();
    saveProgress(updatedProgress);
}
async function updateHomeStats() {
    const progress = getProgress();
    const langProgress = progress[currentLanguage];
    if (!langProgress) {
        console.error('Language progress not found for:', currentLanguage);
        return;
    }
    const totalLearned = Object.values(langProgress.learned).reduce((sum, arr) => sum + arr.length, 0);
    const totalLearnedEl = document.getElementById('totalLearned');
    const totalScoreEl = document.getElementById('totalScore');
    const quizzesTakenEl = document.getElementById('quizzesTaken');
    if (totalLearnedEl) totalLearnedEl.textContent = totalLearned;
    if (totalScoreEl) totalScoreEl.textContent = langProgress.totalScore || 0;
    if (quizzesTakenEl) quizzesTakenEl.textContent = langProgress.quizzesTaken || 0;
    await checkAchievements(langProgress, false);
}
async function navigateToSection(sectionName) {
    
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

   
    localStorage.setItem('currentSection', sectionName);
    currentSection = sectionName;

    if (sectionName === 'home') {
        await updateHomeStats();
    } else if (sectionName === 'practice') {
        showPracticeHome();
    } else if (sectionName === 'progress') {
        await updateProgressDisplay();
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

    
    const saved = localStorage.getItem('currentSection');
    if (saved && document.getElementById(saved)) {
        
        navigateToSection(saved);
    }
});
function showLesson(category) {
    currentCategory = category;
    currentSignIndex = 0;

    
    const heading = document.querySelector('#lessons h2');
    const sub = document.querySelector('#lessons p');
    if (heading) heading.style.display = 'none';
    if (sub) sub.style.display = 'none';

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
    
    const heading = document.querySelector('#lessons h2');
    const sub = document.querySelector('#lessons p');
    if (heading) heading.style.display = '';
    if (sub) sub.style.display = '';

    document.querySelector('.lesson-categories').style.display = 'flex';
    document.getElementById('lessonDetail').classList.add('hidden');
    currentCategory = null;
}
async function displayCurrentSign() {
    if (!currentCategory) return;
    const signs = signCategories[currentCategory];
    const sign = signs[currentSignIndex];
    document.getElementById('signVisual').textContent = sign.visual;
    document.getElementById('signName').textContent = sign.name;
    document.getElementById('signDescription').textContent = sign.description;
    document.getElementById('cardCounter').textContent = `${currentSignIndex + 1} / ${signs.length}`;
    document.getElementById('prevBtn').disabled = currentSignIndex === 0;
    document.getElementById('nextBtn').disabled = currentSignIndex === signs.length - 1;
    await markSignLearned(currentCategory, sign.id);
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
    const langProgress = progress[currentLanguage];
    if (!langProgress) {
        console.error('Language progress not found for:', currentLanguage);
        return;
    }
    const validCategories = ['alphabet', 'numbers', 'greetings', 'common'];
    validCategories.forEach(category => {
        if (!signCategories[category] || !Array.isArray(signCategories[category])) {
            return;
        }
        const total = signCategories[category].length;
        const learned = langProgress.learned[category] ? langProgress.learned[category].length : 0;
        const percentage = Math.round((learned / total) * 100);
        const progressBar = document.getElementById(`progress-${category}`);
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
    });
}
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
async function showQuizResults() {
    document.getElementById('quizView').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');
    const percentage = Math.round((quizScore / currentQuiz.totalQuestions) * 100);
    document.getElementById('finalScore').textContent = quizScore;
    document.getElementById('finalTotal').textContent = currentQuiz.totalQuestions;
    document.getElementById('percentage').textContent = percentage + '%';
    let message = '';
    if (percentage === 100) {
        message = 'Perfect score! You\'re a sign language master!';
    } else if (percentage >= 80) {
        message = ' Excellent work! Keep it up!';
    } else if (percentage >= 60) {
        message = 'Good job! Practice a bit more to master it!';
    } else {
        message = 'Keep practicing! You\'ll get better!';
    }
    document.getElementById('resultsMessage').textContent = message;
    await updateQuizStats(quizScore, currentQuiz.totalQuestions);
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
async function updateProgressDisplay() {
    try {
        const progress = getProgress();
        const langProgress = progress[currentLanguage];
        if (!langProgress || !langProgress.learned) {
            console.error('Language progress not found for:', currentLanguage);
            displayAchievements(null);
            return;
        }
        const validCategories = ['alphabet', 'numbers', 'greetings', 'common'];
        const totalSigns = validCategories.reduce((sum, category) => {
            return sum + (signCategories[category] ? signCategories[category].length : 0);
        }, 0);
        const learnedSigns = Object.values(langProgress.learned).reduce((sum, arr) => sum + arr.length, 0);
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
        validCategories.forEach(category => {
            if (!signCategories[category] || !Array.isArray(signCategories[category])) {
                return;
            }
            const total = signCategories[category].length;
            const learned = langProgress.learned[category] ? langProgress.learned[category].length : 0;
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
    const rhythmStats = langProgress.rhythmGameStats || {
        totalGamesPlayed: 0,
        highScore: 0,
        totalScore: 0
    };
    const avgScore = rhythmStats.totalGamesPlayed > 0 
        ? Math.round(rhythmStats.totalScore / rhythmStats.totalGamesPlayed) 
        : 0;
    const rhythmStatsItem = document.createElement('div');
    rhythmStatsItem.className = 'progress-item rhythm-game-stats';
    rhythmStatsItem.innerHTML = `
        <div class="progress-item-header flex items-center justify-between gap-2">
            <span class="progress-item-name">🎵 Rhythm Game Performance</span>
            <span class="progress-item-percentage ml-auto text-right">${rhythmStats.totalGamesPlayed} ${rhythmStats.totalGamesPlayed === 1 ? 'game' : 'games'} played</span>
        </div>
        <div class="rhythm-stats-grid">
            <div class="rhythm-stat-card">
                <div class="rhythm-stat-label">High Score</div>
                <div class="rhythm-stat-value">${rhythmStats.highScore}</div>
            </div>
            <div class="rhythm-stat-card">
                <div class="rhythm-stat-label">Average Score</div>
                <div class="rhythm-stat-value">${avgScore}</div>
            </div>
            <div class="rhythm-stat-card">
                <div class="rhythm-stat-label">Total Score</div>
                <div class="rhythm-stat-value">${rhythmStats.totalScore}</div>
            </div>
        </div>
    `;
    categoryProgressList.appendChild(rhythmStatsItem);
    await checkAchievements(langProgress, false);
    displayAchievements(langProgress);
    } catch (error) {
        console.error('Error updating progress display:', error);
        try {
            const progress = getProgress();
            const langProgress = progress[currentLanguage];
            await checkAchievements(langProgress, false);
            displayAchievements(langProgress);
        } catch (e) {
            console.error('Error displaying achievements:', e);
            displayAchievements(null);
        }
    }
}
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
        condition: (progress) => {
            const validCategories = ['alphabet', 'numbers', 'greetings', 'common'];
            return validCategories.every(category => 
                progress.learned[category] && 
                signCategories[category] && 
                progress.learned[category].length === signCategories[category].length
            );
        }
    },
    {
        id: 'rhythm_player',
        icon: '🎵',
        title: 'Rhythm Player',
        description: 'Play your first rhythm game',
        condition: (progress) => progress.rhythmGameStats && progress.rhythmGameStats.totalGamesPlayed >= 1
    },
    {
        id: 'rhythm_enthusiast',
        icon: '🎮',
        title: 'Rhythm Enthusiast',
        description: 'Play 5 rhythm games',
        condition: (progress) => progress.rhythmGameStats && progress.rhythmGameStats.totalGamesPlayed >= 5
    },
    {
        id: 'rhythm_champion',
        icon: '🏅',
        title: 'Rhythm Champion',
        description: 'Score 100+ points in a rhythm game',
        condition: (progress) => progress.rhythmGameStats && progress.rhythmGameStats.highScore >= 100
    }
];
async function checkAchievements(langProgress, showNotifications = true) {
    if (!langProgress || !langProgress.achievements) {
        console.warn('Cannot check achievements - progress data invalid');
        return;
    }
    let newAchievementUnlocked = false;
    const unlockedAchievements = [];
    achievements.forEach(achievement => {
        try {
            if (!langProgress.achievements.includes(achievement.id)) {
                if (achievement.condition(langProgress)) {
                    langProgress.achievements.push(achievement.id);
                    unlockedAchievements.push(achievement);
                    newAchievementUnlocked = true;
                }
            }
        } catch (error) {
            console.error(`Error checking achievement ${achievement.id}:`, error);
        }
    });
    if (newAchievementUnlocked) {
        const fullProgress = getProgress();
        fullProgress[currentLanguage].achievements = langProgress.achievements;
        saveProgress(fullProgress);
        if (showNotifications) {
            unlockedAchievements.forEach(achievement => {
                showAchievementNotification(achievement);
            });
        } else {
            console.log('Retroactively unlocked achievements:', unlockedAchievements.map(a => a.title));
        }
        if (window.StatsDB && window.StatsDB.save) {
            await window.StatsDB.save();
        }
    }
}
function showAchievementNotification(achievement) {
    alert(`🎉 Achievement Unlocked!\n\n${achievement.icon} ${achievement.title}\n${achievement.description}`);
}
function displayAchievements(progress) {
    const achievementsList = document.getElementById('achievementsList');
    if (!achievementsList) {
        console.warn('Achievements list element not found');
        return;
    }
    achievementsList.innerHTML = '';
    if (!progress || !progress.achievements) {
        console.warn('Progress or achievements not found');
        achievements.forEach(achievement => {
            const achievementItem = document.createElement('div');
            achievementItem.className = 'achievement-item locked';
            achievementItem.innerHTML = `
                <div class="achievement-icon">🔒</div>
                <div class="achievement-text">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                </div>
            `;
            achievementsList.appendChild(achievementItem);
        });
        return;
    }
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
let rhythmGame = {
    isPlaying: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    fallingSign: null,
    gameSpeed: 3000, 
    spawnInterval: null,
    animationFrame: null,
    category: 'alphabet'
};
function startRhythmGame(category = 'alphabet') {
    rhythmGame.category = category;
    rhythmGame.isPlaying = true;
    rhythmGame.score = 0;
    rhythmGame.combo = 0;
    rhythmGame.maxCombo = 0;
    document.getElementById('practiceHome').classList.add('hidden');
    document.getElementById('rhythmGame').classList.remove('hidden');
    updateRhythmGameUI();
    spawnFallingSign();
    rhythmGame.spawnInterval = setInterval(spawnFallingSign, rhythmGame.gameSpeed);
}
function spawnFallingSign() {
    if (!rhythmGame.isPlaying) return;
    const signs = signCategories[rhythmGame.category];
    const correctSign = signs[Math.floor(Math.random() * signs.length)];
    const wrongOptions = signs
        .filter(s => s.id !== correctSign.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
    const allOptions = [correctSign, ...wrongOptions].sort(() => Math.random() - 0.5);
    rhythmGame.fallingSign = {
        sign: correctSign,
        options: allOptions,
        position: 0,
        startTime: Date.now()
    };
    displayFallingSign();
    animateFallingSign();
}
function displayFallingSign() {
    const signElement = document.getElementById('fallingSign');
    const optionsContainer = document.getElementById('rhythmOptions');
    signElement.textContent = rhythmGame.fallingSign.sign.visual;
    signElement.style.top = '0%';
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
    if (progress >= 1) {
        missedSign();
        return;
    }
    rhythmGame.animationFrame = requestAnimationFrame(animateFallingSign);
}
function checkRhythmAnswer(isCorrect) {
    if (!rhythmGame.fallingSign) return;
    cancelAnimationFrame(rhythmGame.animationFrame);
    const signElement = document.getElementById('fallingSign');
    const feedbackElement = document.getElementById('rhythmFeedback');
    if (isCorrect) {
        rhythmGame.score += 10;
        rhythmGame.combo++;
        rhythmGame.maxCombo = Math.max(rhythmGame.maxCombo, rhythmGame.combo);
        signElement.classList.add('rhythm-correct');
        feedbackElement.textContent = '✓ Perfect!';
        feedbackElement.className = 'rhythm-feedback show correct';
        rhythmGame.gameSpeed = Math.max(2000, rhythmGame.gameSpeed - 50);
    } else {
        rhythmGame.combo = 0;
        signElement.classList.add('rhythm-wrong');
        feedbackElement.textContent = '✗ Wrong!';
        feedbackElement.className = 'rhythm-feedback show wrong';
    }
    updateRhythmGameUI();
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
    showRhythmGameResults();
}
async function showRhythmGameResults() {
    document.getElementById('rhythmGame').classList.add('hidden');
    document.getElementById('rhythmResults').classList.remove('hidden');
    document.getElementById('rhythmFinalScore').textContent = rhythmGame.score;
    document.getElementById('rhythmMaxCombo').textContent = rhythmGame.maxCombo;
    let message = '';
    if (rhythmGame.score >= 100) {
        message = ' Amazing! You have great rhythm!';
    } else if (rhythmGame.score >= 50) {
        message = ' Good job! Keep practicing!';
    } else {
        message = ' Nice try! Practice makes perfect!';
    }
    document.getElementById('rhythmResultMessage').textContent = message;
    await saveRhythmGameStats(rhythmGame.score, rhythmGame.maxCombo);
}
async function saveRhythmGameStats(score, maxCombo) {
    const progress = getProgress();
    const langProgress = progress[currentLanguage];
    if (!langProgress.rhythmGameStats) {
        langProgress.rhythmGameStats = {
            totalGamesPlayed: 0,
            highScore: 0,
            totalScore: 0
        };
    }
    langProgress.rhythmGameStats.totalGamesPlayed += 1;
    langProgress.rhythmGameStats.highScore = Math.max(langProgress.rhythmGameStats.highScore || 0, score);
    langProgress.rhythmGameStats.totalScore += score;
    await checkAchievements(langProgress);
    saveProgress(progress);
    if (window.StatsDB && window.StatsDB.save) {
        await window.StatsDB.save();
    }
    console.log('Rhythm game stats saved:', langProgress.rhythmGameStats);
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
function saveProgress(progress) {
    if (progress) {
        localStorage.setItem('signLanguageProgress', JSON.stringify(progress));
    }
    saveUserProgress();
}