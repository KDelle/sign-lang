/* ===================================
   SUPABASE CONFIGURATION
   =================================== */
const SUPABASE_URL = 'https://oiepfirmlsbalcmpwbyk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pZXBmaXJtbHNiYWxjbXB3YnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjY1MjEsImV4cCI6MjA4NjY0MjUyMX0.s1hrIKPc47WNrc4f6MGmsZL12h36DDoFuAMT7dUXNjs';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
                progress[lang].quizzesTaken += row.quizzes_taken || 0;
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
   YOUR EXISTING CODE CONTINUES HERE
   (Keep ALL your sign language data, game logic, etc.)
   =================================== */